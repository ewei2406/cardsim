use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use log;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio::sync::{Mutex, RwLock};
use tokio::time::{timeout, Duration};
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::WebSocketStream;

use crate::constants::ID_REQUEST_TIMEOUT_SECONDS;

pub type ConnectionId = usize;

pub struct ConnectionManager {
    connections: Arc<
        RwLock<HashMap<ConnectionId, Arc<Mutex<SplitSink<WebSocketStream<TcpStream>, Message>>>>>,
    >,
}

impl ConnectionManager {
    pub fn new() -> ConnectionManager {
        ConnectionManager {
            connections: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn send_message(
        &self,
        client_id: ConnectionId,
        message: Message,
    ) -> Result<(), String> {
        let connections = self.connections.read().await;
        match connections.get(&client_id) {
            Some(tx) => {
                let mut tx = tx.lock().await;
                match tx.send(message).await {
                    Ok(_) => Ok(()),
                    Err(e) => Err(format!("Error sending message: {:?}", e)),
                }
            }
            None => Err(format!("Client {} not found.", client_id)),
        }
    }

    async fn create_client(
        &self,
        stream: WebSocketStream<TcpStream>,
    ) -> Result<(ConnectionId, SplitStream<WebSocketStream<TcpStream>>), String> {
        let client_addr = stream.get_ref().peer_addr().map_err(|e| e.to_string())?;
        let client_addr = client_addr.ip().to_string();
        let (mut tx, mut rx) = stream.split();

        log::info!("Beginning ID setup for {}.", client_addr);
        let client_id_request =
            match timeout(Duration::from_secs(ID_REQUEST_TIMEOUT_SECONDS), rx.next()).await {
                Ok(Some(Ok(msg))) => {
                    log::info!("{} sent message: {:?}.", client_addr, msg);
                    match msg.to_text() {
                        Ok(text) => {
                            if text.len() == 0 {
                                log::warn!("{} sent an empty message in ID request.", client_addr);
                                return Err("Empty message received for ID.".to_string());
                            }
                            match text.parse::<ConnectionId>() {
                                Ok(id) => id,
                                Err(err) => {
                                    log::warn!("{} sent malformed ID: {:?}.", client_addr, msg);
                                    let _ = tx.send("Malformed ID.".into()).await;
                                    return Err(format!(
                                        "Error parsing ID from message: {:?}",
                                        err.to_string()
                                    ));
                                }
                            }
                        }
                        Err(_) => {
                            log::warn!(
                                "{} sent malformed ID: {:?}.",
                                client_addr,
                                msg.clone().into_data()
                            );
                            let _ = tx.send("Malformed ID.".into()).await;
                            return Err(format!(
                                "Non-text message received for ID: {:?}",
                                msg.into_data()
                            ));
                        }
                    }
                }
                Ok(Some(Err(e))) => {
                    log::warn!("Error receiving message from {}: {:?}", client_addr, e);
                    return Err("Error receiving message".to_string());
                }
                Ok(None) => {
                    log::warn!("{} closed the connection before sending ID.", client_addr,);
                    return Err("Connection closed before receiving ID.".to_string());
                }
                Err(_) => {
                    log::warn!(
                        "{} timed out in ID setup after {} seconds.",
                        client_addr,
                        ID_REQUEST_TIMEOUT_SECONDS
                    );
                    let _ = tx
                        .send("error: Timed out waiting for ID message.".into())
                        .await;
                    return Err("Timed out waiting for ID message.".to_string());
                }
            };
        log::info!("{} has requested ID {}.", client_addr, client_id_request);

        if self
            .connections
            .read()
            .await
            .contains_key(&client_id_request)
        {
            log::warn!(
                "ID {} requested by {} already in use.",
                client_id_request,
                client_addr
            );
            let _ = tx.send("ID in use already.".into()).await;
            return Err(format!("ID {} already in use.", client_id_request));
        }

        let _ = tx.send("success".into()).await;
        self.connections
            .write()
            .await
            .insert(client_id_request, Arc::new(Mutex::new(tx)));
        log::info!(
            "{} has been assigned ID {}.",
            client_addr,
            client_id_request
        );

        Ok((client_id_request, rx))
    }

    pub async fn handle_connection(
        &self,
        connection: tokio::net::TcpStream,
    ) -> Result<(ConnectionId, SplitStream<WebSocketStream<TcpStream>>), String> {
        log::info!(
            "New connection: {}",
            match connection.peer_addr() {
                Ok(addr) => addr.to_string(),
                Err(_) => "Unknown".to_string(),
            }
        );

        let ws_stream = match tokio_tungstenite::accept_async(connection).await {
            Ok(ws_stream) => ws_stream,
            Err(e) => {
                log::warn!("Error during WebSocket handshake: {:?}", e);
                return Err(format!("Error during WebSocket handshake: {:?}", e));
            }
        };

        self.create_client(ws_stream).await
    }
}
