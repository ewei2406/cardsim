use std::{collections::HashSet, sync::Arc};

use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::Message;

use crate::{
    action::*, connection_manager::ConnectionId, entity::Entity, game_controller::Game,
    gamestate::*, util,
};

use super::{GameController, GameId};

#[derive(Deserialize)]
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

impl GameController {
    async fn apply_action(&self, client_id: ConnectionId, action: ControllerAction) {
        match action {
            ControllerAction::CreateGame => self.create_game(client_id).await,
            ControllerAction::JoinGame { game_id, nickname } => {
                self.join_game(game_id, client_id, nickname).await
            }
            ControllerAction::LeaveGame => self.leave_game(client_id).await,
        }
    }

    pub async fn handle_message(&self, client_id: ConnectionId, message: Message) {
        // A controller action
        if let Ok(action) = serde_json::from_str::<ControllerAction>(&message.to_string()) {
            self.apply_action(client_id, action).await;
        // A game action
        } else if let Ok(action) = serde_json::from_str::<Action>(&message.to_string()) {
            if let Some(game_id) = self.get_client_game_id(client_id).await {
                self.update_game_and_sync(game_id, action, client_id)
                    .await
                    .unwrap();
            } else {
                self.error(client_id, "Client not in a game.".to_string())
                    .await;
            }
        } else {
            self.error(client_id, "Invalid message format.".to_string())
                .await;
        }
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
        log::info!("Game {} created by client {}", game_id, host_id);
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
        self.send_to_client(client_id, serde_json::to_string(&message).unwrap().into()).await;

        // Update game record
        self.client_map.write().await.insert(client_id, game_id);
        game.lock().await.player_ids.insert(client_id);
        log::info!("Client {} joined game {}", client_id, game_id);
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
        log::info!("Client {} left game {}.", client_id, game.game_id);
    }
}
