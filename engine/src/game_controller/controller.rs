use log::info;
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use tokio_tungstenite::tungstenite::Message;

use crate::connection_manager::{ConnectionId, ConnectionManager};
use crate::entity::Entity;
use crate::gamestate::AnonGameState;
use crate::util;
use crate::{
    action::{Action, Actionable, Outcome},
    gamestate::GameState,
};

pub enum ControllerAction {
    CreateGame,
    JoinGame { game_id: GameId, nickname: String },
    LeaveGame,
}

#[derive(Serialize)]
pub enum ControllerResponse {
    GameCreated {
        game_id: GameId,
    },
    Ok,
    Error {
        message: String,
    },
    Delta {
        changed: Option<AnonGameState>,
        deleted: Option<Vec<Entity>>,
    },
}

impl ControllerResponse {
    pub fn from_outcome(outcome: &Outcome, perspective: ConnectionId) -> Self {
        match outcome {
            Outcome::Delta { changed, deleted } => ControllerResponse::Delta {
                changed: changed.as_ref().map(|gs| gs.anonymize(perspective)),
                deleted: deleted.clone(),
            },
            Outcome::None => ControllerResponse::Ok,
            Outcome::Invalid(_) => ControllerResponse::Error {
                message: "Invalid game state produced.".to_string(),
            },
        }
    }
}

pub type GameId = usize;

pub struct Game {
    game_id: GameId,
    host_id: usize,
    player_ids: HashSet<usize>,
    game_state: GameState,
}

pub struct GameController<'a> {
    games: RwLock<HashMap<GameId, Arc<Mutex<Game>>>>,
    client_map: RwLock<HashMap<usize, GameId>>,
    connection_manager: &'a ConnectionManager,
}

impl<'a> GameController<'a> {
    pub fn new(connection_manager: &'a ConnectionManager) -> Self {
        GameController {
            connection_manager,
            client_map: RwLock::new(HashMap::new()),
            games: RwLock::new(HashMap::new()),
        }
    }

    async fn error(&self, client_id: ConnectionId, err: String) {
        let message = ControllerResponse::Error {
            message: err.clone(),
        };
        self.send_to_client(client_id, serde_json::to_string(&message).unwrap().into())
            .await;
        info!("Error: {}", err);
    }

    async fn get_client_game_id(&self, client_id: ConnectionId) -> Option<GameId> {
        self.client_map.read().await.get(&client_id).copied()
    }

    async fn get_client_game(&self, client_id: ConnectionId) -> Result<Arc<Mutex<Game>>, String> {
        let game_id = self.get_client_game_id(client_id).await;
        match game_id {
            Some(game_id) => self.get_game(game_id).await,
            None => Err("Client not in game".into()),
        }
    }

    async fn get_game(&self, game_id: GameId) -> Result<Arc<Mutex<Game>>, String> {
        let games = self.games.read().await;
        if let Some(game) = games.get(&game_id) {
            Ok(Arc::clone(game))
        } else {
            Err("Game not found".into())
        }
    }

    async fn apply_action(&self, client_id: ConnectionId, action: ControllerAction) {
        match action {
            ControllerAction::CreateGame => self.create_game(client_id).await,
            ControllerAction::JoinGame { game_id, nickname } => {
                self.join_game(game_id, client_id, nickname).await
            }
            ControllerAction::LeaveGame => self.leave_game(client_id).await,
        }
    }

    async fn send_to_game_clients(&self, game_id: GameId, message: Message) {
        let games = self.games.read().await;
        if let Some(game) = games.get(&game_id) {
            let game = game.lock().await;
            for client_id in &game.player_ids {
                self.connection_manager
                    .send_message(*client_id, message.clone())
                    .await;
            }
        }
    }

    async fn send_to_client(&self, client_id: ConnectionId, message: Message) {
        self.connection_manager
            .send_message(client_id, message)
            .await;
    }

    async fn update_game_and_sync(
        &self,
        game_id: GameId,
        action: Action,
        perspective: ConnectionId,
    ) -> Result<(), String> {
        let game = self.get_game(game_id).await?;
        let outcome = game.lock().await.game_state.apply(action);
        let controller_response = ControllerResponse::from_outcome(&outcome, perspective);

        if let ControllerResponse::Delta { .. } = controller_response {
            let message = serde_json::to_string(&controller_response).unwrap().into();
            self.send_to_game_clients(game_id, message).await;
        }
        Ok(())
    }

    async fn create_game(&self, host_id: usize) {
        // Host can't be in a game already
        if let Some(_) = self.get_client_game_id(host_id).await {
            self.error(host_id, format!("Client {} already in game.", host_id))
                .await;
            return;
        }

        // Create the game
        let game_id = util::get_id();
        let game = Game {
            game_id,
            host_id,
            player_ids: HashSet::new(),
            game_state: GameState::new(),
        };
        let msg = ControllerResponse::GameCreated { game_id };
        self.send_to_client(host_id, serde_json::to_string(&msg).unwrap().into())
            .await;

        // Update game records
        self.games
            .write()
            .await
            .insert(game_id, Arc::new(Mutex::new(game)));
        info!("Game {} created by client {}", game_id, host_id);
    }

    async fn join_game(&self, game_id: GameId, client_id: usize, nickname: String) {
        // Host can't be in a game already
        if let Some(_) = self.get_client_game_id(client_id).await {
            self.error(client_id, format!("Client {} already in game.", client_id))
                .await;
            return;
        }

        // Get the game to join
        let game = match self.get_game(game_id).await {
            Ok(game) => game,
            Err(_) => {
                return self
                    .error(client_id, format!("Game {} not found.", game_id))
                    .await;
            }
        };

        // Add the hand to the game
        let add_action = Action::AddHand {
            nickname,
            client_id,
        };
        let action_result = self
            .update_game_and_sync(game_id, add_action, client_id)
            .await;
        if let Err(_) = action_result {
            return self
                .error(client_id, format!("Failed to join game {}", game_id))
                .await;
        }

        // Send the entire game state to catch them up
        let message = ControllerResponse::Delta {
            changed: Some(game.lock().await.game_state.anonymize(client_id)),
            deleted: None,
        };
        self.send_to_client(client_id, serde_json::to_string(&message).unwrap().into());

        // Update game record
        self.client_map.write().await.insert(client_id, game_id);
        game.lock().await.player_ids.insert(client_id);
        info!("Client {} joined game {}", client_id, game_id);
    }

    async fn leave_game(&self, client_id: usize) {
        // Get the game to leave
        let game = match self.get_client_game(client_id).await {
            Ok(game) => game,
            Err(_) => {
                return self.error(client_id, "Client not in game.".into()).await;
            }
        };

        // Apply the action
        let remove_action = Action::RemoveHand { client_id };
        let action_result = self
            .update_game_and_sync(game.lock().await.game_id, remove_action, client_id)
            .await;
        if let Err(_) = action_result {
            return self.error(client_id, "Failed to leave game.".into()).await;
        }

        // Update records
        self.client_map.write().await.remove(&client_id);
        let mut game = game.lock().await;
        game.player_ids.remove(&client_id);
        info!("Client {} left game {}.", client_id, game.game_id);
    }

    async fn remove_game(&self, game_id: GameId) {
        let mut games = self.games.write().await;
        games.remove(&game_id);
    }

    async fn cleanup_stale_games(&self) {
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
