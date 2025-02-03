use serde::Serialize;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};

use crate::connection_manager::*;
use crate::gamestate::GameState;

use super::ServerResponse;

pub type GameId = usize;

#[derive(Debug)]
pub struct Game {
    pub game_id: GameId,
    pub game_state: GameState,
}

pub struct GameController {
    pub games: RwLock<HashMap<GameId, Arc<Mutex<Game>>>>,
    pub client_map: RwLock<HashMap<usize, GameId>>,
    pub connection_manager: Arc<ConnectionManager>,
}

#[derive(Debug, Serialize)]
pub struct GameDesc {
    pub game_id: GameId,
    pub player_ct: usize,
}

impl GameController {
    pub fn new(connection_manager: Arc<ConnectionManager>) -> Self {
        GameController {
            connection_manager,
            client_map: RwLock::new(HashMap::new()),
            games: RwLock::new(HashMap::new()),
        }
    }

    pub async fn error(&self, client_id: ConnectionId, err: String) {
        self.send_to_client(client_id, &ServerResponse::Error { message: err })
            .await;
    }

    pub async fn get_client_game_id(&self, client_id: ConnectionId) -> Option<GameId> {
        self.client_map.read().await.get(&client_id).copied()
    }

    pub async fn get_client_game(&self, client_id: ConnectionId) -> Option<Arc<Mutex<Game>>> {
        let game_id = self.get_client_game_id(client_id).await;
        match game_id {
            Some(game_id) => self.get_game(game_id).await,
            None => None,
        }
    }

    pub async fn get_game(&self, game_id: GameId) -> Option<Arc<Mutex<Game>>> {
        let games = self.games.read().await;
        if let Some(game) = games.get(&game_id) {
            Some(Arc::clone(game))
        } else {
            None
        }
    }

    pub async fn send_to_game_clients(&self, game_id: GameId, message: &ServerResponse) {
        let games = self.games.read().await;
        if let Some(game) = games.get(&game_id) {
            let game = game.lock().await;
            for client in &game.game_state.players {
                let _ = self
                    .connection_manager
                    .send_message(client.client_id, message)
                    .await;
            }
        }
    }

    pub async fn send_to_client(&self, client_id: ConnectionId, message: &ServerResponse) {
        let _ = self
            .connection_manager
            .send_message(client_id, message)
            .await;
    }

    pub async fn cleanup_stale_games(&self) {
        let mut games = self.games.write().await;
        let mut to_remove = Vec::new();
        for (game_id, game) in games.iter() {
            if game.lock().await.game_state.players.is_empty() {
                to_remove.push(*game_id);
            }
        }
        for game_id in to_remove {
            games.remove(&game_id);
        }
    }

    pub async fn list_games(&self) -> Vec<GameDesc> {
        let games = self.games.read().await;
        let mut game_descs = Vec::new();
        for (game_id, game) in games.iter() {
            let player_ct = game.lock().await.game_state.players.len();
            game_descs.push(GameDesc {
                game_id: *game_id,
                player_ct,
            });
        }
        game_descs
    }

    pub async fn delete_game(&self, game_id: GameId) {
        {
            // Get the game
            let mut games = self.games.write().await;
            let game = match games.get(&game_id) {
                Some(game) => game,
                None => {
                    log::error!("Game {} not found", game_id);
                    return;
                }
            };

            // Remove the game from the client map
            for client in &game.lock().await.game_state.players {
                let mut client_map = self.client_map.write().await;
                client_map.remove(&client.client_id);
            }
            games.remove(&game_id);
        }

        // Send a message to all clients in the game
        self.send_to_game_clients(game_id, &ServerResponse::GameLeft)
            .await;
    }
}
