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

    pub async fn send_message(&self, client_id: ConnectionId, message: Message) -> Result<(), String> {
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
        let (tx, mut rx) = stream.split();

        let client_id_request =
            match timeout(Duration::from_secs(ID_REQUEST_TIMEOUT_SECONDS), rx.next()).await {
                Ok(Some(Ok(msg))) => {
                    log::debug!("Received message: {:?}", msg);
                    match msg.to_text() {
                        Ok(text) => match text.parse::<ConnectionId>() {
                            Ok(id) => id,
                            Err(_) => {
                                return Err("Invalid ID format.".to_string());
                            }
                        },
                        Err(_) => {
                            return Err("Non-text message received for ID.".to_string());
                        }
                    }
                }
                Ok(Some(Err(e))) => {
                    log::warn!("Error receiving message: {:?}", e);
                    return Err("Error receiving message".to_string());
                }
                Ok(None) => {
                    return Err("Connection closed before receiving ID.".to_string());
                }
                Err(_) => {
                    return Err("Timed out waiting for ID message.".to_string());
                }
            };

        if self
            .connections
            .read()
            .await
            .contains_key(&client_id_request)
        {
            return Err(format!("ID {} already in use.", client_id_request));
        }

        self.connections
            .write()
            .await
            .insert(client_id_request, Arc::new(Mutex::new(tx)));

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
                return Err(format!("Error during WebSocket handshake: {:?}", e));
            }
        };

        self.create_client(ws_stream).await
    }
}
