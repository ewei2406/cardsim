use axum::extract::ws::WebSocket;
use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use log;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};

use crate::game_controller::ServerResponse;
use crate::util;

pub type ConnectionId = usize;

pub struct ConnectionManager {
    connections: Arc<
        RwLock<
            HashMap<
                ConnectionId,
                Arc<Mutex<SplitSink<axum::extract::ws::WebSocket, axum::extract::ws::Message>>>,
            >,
        >,
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

    pub async fn handle_connection(
        &self,
        stream: WebSocket,
    ) -> Result<(ConnectionId, SplitStream<WebSocket>), String> {
        let (mut tx, rx) = stream.split();

        let client_id = util::get_id();
        if self.connections.read().await.contains_key(&client_id) {
            log::error!("ID {} requested is already in use.", client_id,);
            return Err(format!("ID {} already in use.", client_id));
        }

        let msg = ServerResponse::ClientConnected { client_id };
        let _ = tx
            .send(
                serde_json::to_string(&msg)
                    .map_err(|e| format!("Error serializing message: {:?}", e))?
                    .into(),
            )
            .await;
        self.connections
            .write()
            .await
            .insert(client_id, Arc::new(Mutex::new(tx)));
        log::debug!("Client with ID {} added.", client_id);

        Ok((client_id, rx))
    }
}
