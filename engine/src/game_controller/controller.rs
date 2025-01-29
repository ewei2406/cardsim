use log::info;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use tokio_tungstenite::tungstenite::Message;

use crate::connection_manager::*;
use crate::gamestate::GameState;

pub type GameId = usize;

pub struct Game {
    pub game_id: GameId,
    pub player_ids: HashSet<usize>,
    pub game_state: GameState,
}

pub struct GameController {
    pub games: RwLock<HashMap<GameId, Arc<Mutex<Game>>>>,
    pub client_map: RwLock<HashMap<usize, GameId>>,
    pub connection_manager: Arc<ConnectionManager>,
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
        self.send_to_client(
            client_id,
            format!("{{\"type\":\"error\",\"error\":\"{}\"}}", err).into(),
        )
        .await;
        info!("Error: {}", err);
    }

    pub async fn get_client_game_id(&self, client_id: ConnectionId) -> Option<GameId> {
        self.client_map.read().await.get(&client_id).copied()
    }

    pub async fn get_client_game(
        &self,
        client_id: ConnectionId,
    ) -> Result<Arc<Mutex<Game>>, String> {
        let game_id = self.get_client_game_id(client_id).await;
        match game_id {
            Some(game_id) => self.get_game(game_id).await,
            None => Err("Client not in game".into()),
        }
    }

    pub async fn get_game(&self, game_id: GameId) -> Result<Arc<Mutex<Game>>, String> {
        let games = self.games.read().await;
        if let Some(game) = games.get(&game_id) {
            Ok(Arc::clone(game))
        } else {
            Err("Game not found".into())
        }
    }

    pub async fn send_to_game_clients(&self, game_id: GameId, message: Message) {
        let games = self.games.read().await;
        if let Some(game) = games.get(&game_id) {
            let game = game.lock().await;
            for client_id in &game.player_ids {
                let _ = self
                    .connection_manager
                    .send_message(*client_id, message.clone())
                    .await;
            }
        }
    }

    pub async fn send_to_client(&self, client_id: ConnectionId, message: Message) {
        let _ = self
            .connection_manager
            .send_message(client_id, message)
            .await;
    }

    pub async fn cleanup_stale_games(&self) {
        let mut games = self.games.write().await;
        let mut to_remove = Vec::new();
        for (game_id, game) in games.iter() {
            if game.lock().await.player_ids.is_empty() {
                to_remove.push(*game_id);
            }
        }
        for game_id in to_remove {
            games.remove(&game_id);
        }
    }
}
