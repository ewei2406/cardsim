use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use log;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio::sync::{Mutex, RwLock};
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::WebSocketStream;

use crate::game_controller::ServerResponse;
use crate::util;

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
        message: &ServerResponse,
    ) -> Result<(), String> {
        let connections = self.connections.read().await;
        match connections.get(&client_id) {
            Some(tx) => {
                let mut tx = tx.lock().await;
                match tx
                    .send(
                        serde_json::to_string(message)
                            .map_err(|e| format!("Error serializing message: {:?}", e))?
                            .into(),
                    )
                    .await
                {
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
        let (mut tx, rx) = stream.split();

        let client_id = util::get_id();
        if self.connections.read().await.contains_key(&client_id) {
            log::error!(
                "ID {} requested by {} already in use.",
                client_id,
                client_addr
            );
            return Err(format!("ID {} already in use.", client_id));
        }

        let _ = tx.send(client_id.to_string().into()).await;
        self.connections
            .write()
            .await
            .insert(client_id, Arc::new(Mutex::new(tx)));
        log::info!("{} has been assigned ID {}.", client_addr, client_id);

        Ok((client_id, rx))
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
