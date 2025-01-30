use std::{collections::HashSet, sync::Arc};

use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::Message;

use crate::{
    action::*, connection_manager::ConnectionId, entity::Entity, game_controller::Game,
    gamestate::*, util,
};

use super::{GameController, GameId};

#[derive(Deserialize, Debug)]
#[serde(tag = "command")]
pub enum ControllerAction {
    CreateGame { nickname: String },
    JoinGame { game_id: GameId, nickname: String },
    ChatMessage { message: String },
    LeaveGame,
}

#[derive(Serialize, Debug)]
#[serde(tag = "type")]
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
    ChatMessage {
        client_id: ConnectionId,
        message: String,
    },
}

impl ControllerResponse {
    pub fn from_outcome(outcome: &Outcome, perspective: ConnectionId) -> Self {
        match outcome {
            Outcome::Delta { changed, deleted } => ControllerResponse::Delta {
                changed: changed.as_ref().map(|gs| gs.anonymize(perspective)),
                deleted: deleted.clone(),
            },
            Outcome::Invalid(err) => ControllerResponse::Error {
                message: format!("{:?}", err),
            },
            Outcome::None => ControllerResponse::Ok,
        }
    }
}

impl GameController {
    async fn apply_action(&self, client_id: ConnectionId, action: ControllerAction) {
        match action {
            ControllerAction::CreateGame { nickname } => {
                let _ = self.create_game(client_id, nickname).await;
            }
            ControllerAction::JoinGame { game_id, nickname } => {
                self.join_game(game_id, client_id, nickname).await
            }
            ControllerAction::LeaveGame => self.leave_game(client_id).await,
            ControllerAction::ChatMessage { message } => {
                self.chat_message(client_id, message).await
            }
        }
    }

    pub async fn handle_message(&self, client_id: ConnectionId, message: Message) {
        // A controller action
        if let Ok(action) = serde_json::from_str::<ControllerAction>(&message.to_string()) {
            log::info!("Client {} sent controller action: {:?}", client_id, action);
            self.apply_action(client_id, action).await;
        // A game action
        } else if let Ok(action) = serde_json::from_str::<Action>(&message.to_string()) {
            if let Some(game_id) = self.get_client_game_id(client_id).await {
                log::info!(
                    "Client {} sent (to game {}) the game action: {:?}",
                    client_id,
                    game_id,
                    action
                );
                let _ = self.update_game_and_sync(game_id, action, client_id).await;
            } else {
                log::warn!(
                    "Client {} tried to send a game action but is not in a game.",
                    client_id
                );
                self.error(client_id, "Client not in a game.".to_string())
                    .await;
            }
        } else {
            log::warn!("Client {} sent invalid message: {:?}", client_id, message);
            self.error(client_id, format!("Invalid message: {:?}", message))
                .await;
        }
    }

    async fn update_game_and_sync(
        &self,
        game_id: GameId,
        action: Action,
        client_id: ConnectionId,
    ) -> Result<(), String> {
        let game = match self.get_game(game_id).await {
            Some(game) => game,
            None => return Err("Game not found.".to_string()),
        };

        let mut game = game.lock().await;
        let outcome = game.game_state.apply(action.clone(), client_id);
        log::debug!(
            "Client {} sent action: {:?}, with outcome {:?}",
            client_id,
            action,
            outcome
        );

        match outcome {
            Outcome::Delta { .. } => {
                for game_client in game.player_ids.iter() {
                    let anonymized = ControllerResponse::from_outcome(&outcome, *game_client);
                    let message = serde_json::to_string(&anonymized).unwrap().into();
                    let _ = self.send_to_client(*game_client, message).await;
                }
            }
            Outcome::Invalid(err) => {
                return Err(format!("Invalid Outcome: {:?}", err));
            }
            Outcome::None => {}
        };
        Ok(())
    }

    pub async fn create_game(&self, client_id: usize, nickname: String) -> Result<GameId, String> {
        // Host can't be in a game already
        if let Some(game_id) = self.get_client_game_id(client_id).await {
            log::warn!(
                "Client {} tried to create a new game, but is already in game {}.",
                client_id,
                game_id
            );
            self.error(client_id, "Client already in game.".into())
                .await;
            return Err("Client already in game.".to_string());
        }

        // Create the game
        let game_id = util::get_id();
        let game = Game {
            game_id,
            player_ids: HashSet::new(),
            game_state: GameState::new(),
        };
        let msg = ControllerResponse::GameCreated { game_id };
        self.send_to_client(client_id, serde_json::to_string(&msg).unwrap().into())
            .await;

        // Update game records
        self.games
            .write()
            .await
            .insert(game_id, Arc::new(Mutex::new(game)));
        log::info!("Game {} created by client {}.", game_id, client_id);

        self.join_game(game_id, client_id, nickname).await;
        Ok(game_id)
    }

    async fn join_game(&self, game_id: GameId, client_id: usize, nickname: String) {
        // Host can't be in a game already
        if let Some(old_id) = self.get_client_game_id(client_id).await {
            log::warn!(
                "Client {} tried to join game {}, but is already in game {}.",
                client_id,
                game_id,
                old_id
            );
            self.error(client_id, "Client already in game.".into())
                .await;
            return;
        }

        // Get the game to join
        let game = match self.get_game(game_id).await {
            Some(game) => game,
            None => {
                log::info!(
                    "Client {} tried to join non-existant game {}.",
                    client_id,
                    game_id
                );
                return self
                    .error(client_id, format!("Game {} not found.", game_id))
                    .await;
            }
        };

        // Add the hand to the game
        let add_action = Action::AddHand { nickname };
        let action_result = self
            .update_game_and_sync(game_id, add_action, client_id)
            .await;
        if let Err(e) = action_result {
            log::error!(
                "Client {} failed to join game {}: {}",
                client_id,
                game_id,
                e
            );
            return self
                .error(client_id, format!("Failed to join game {}.", game_id))
                .await;
        }

        // Send the entire game state to catch them up
        let message = ControllerResponse::Delta {
            changed: Some(game.lock().await.game_state.anonymize(client_id)),
            deleted: None,
        };
        self.send_to_client(client_id, serde_json::to_string(&message).unwrap().into())
            .await;

        // Update game record
        self.client_map.write().await.insert(client_id, game_id);
        game.lock().await.player_ids.insert(client_id);
        log::info!("Client {} joined game {}.", client_id, game_id);
    }

    pub async fn leave_game(&self, client_id: usize) {
        // Get the game to leave
        log::info!("2");
        let game = match self.get_client_game(client_id).await {
            Some(game) => game,
            None => {
                log::info!(
                    "Client {} tried to leave game, but is not in a game.",
                    client_id
                );
                return self.error(client_id, "Client not in game.".into()).await;
            }
        };
        log::info!("3");

        // Apply the action
        let game_id = {
            let game = game.lock().await;
            game.game_id
        };

        let remove_action = Action::RemoveHand;
        let action_result = self
            .update_game_and_sync(game_id, remove_action, client_id)
            .await;

        log::info!("5");

        if let Err(err) = action_result {
            log::error!(
                "Client {} failed to leave game {}: {}",
                client_id,
                game_id,
                err
            );
            log::info!("6");
            return self.error(client_id, "Failed to leave game.".into()).await;
        }
        log::info!("4");

        // Update records
        self.client_map.write().await.remove(&client_id);
        game.lock().await.player_ids.remove(&client_id);
        log::info!("Client {} left game {}.", client_id, game_id);
    }

    async fn chat_message(&self, client_id: usize, message: String) {
        let game_id = match self.get_client_game_id(client_id).await {
            Some(game_id) => game_id,
            None => {
                log::info!(
                    "Client {} tried to send chat message, but is not in a game.",
                    client_id
                );
                return self
                    .error(client_id, "Client not in a game.".to_string())
                    .await;
            }
        };
        self.send_to_game_clients(
            game_id,
            serde_json::to_string(&ControllerResponse::ChatMessage { client_id, message })
                .unwrap()
                .into(),
        )
        .await;
        log::info!(
            "Client {} sent a chat message to game {}.",
            client_id,
            game_id
        );
    }
}
