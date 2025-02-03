use std::sync::Arc;

use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::Message;

use crate::{
    action::*,
    connection_manager::ConnectionId,
    game_controller::{responses::ServerResponse, Game},
    gamestate::*,
    util,
};

use super::{
    requests::{ClientRequest, Command},
    GameController, GameId,
};

impl GameController {
    async fn apply_action(&self, client_id: ConnectionId, command: Command) {
        match command {
            Command::CreateGame { nickname } => {
                let _ = self.create_game(client_id, nickname).await;
            }
            Command::JoinGame { game_id, nickname } => {
                self.join_game(game_id, client_id, nickname).await
            }
            Command::LeaveGame => self.leave_game(client_id).await,
            Command::ChatMessage { message } => self.chat_message(client_id, message).await,
            Command::ListGames => self.send_available_games(client_id).await,
        }
    }

    async fn send_available_games(&self, client_id: ConnectionId) {
        let games = self.list_games().await;
        let message = ServerResponse::AvailableGames { games };
        self.send_to_client(client_id, &message).await;
    }

    pub async fn handle_message(&self, client_id: ConnectionId, message: Message) {
        if let Ok(request) = serde_json::from_str::<ClientRequest>(&message.to_string()) {
            match request {
                ClientRequest::Action(action) => {
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
                }
                ClientRequest::Command(action) => {
                    log::info!("Client {} sent command: {:?}", client_id, action);
                    self.apply_action(client_id, action).await;
                }
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
                for game_client in game.game_state.players.iter() {
                    let anonymized = ServerResponse::from_outcome(&outcome, game_client.client_id);
                    let _ = self
                        .send_to_client(game_client.client_id, &anonymized)
                        .await;
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
            game_state: GameState::new(),
        };
        let message = ServerResponse::GameCreated { game_id };
        self.send_to_client(client_id, &message).await;

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

        // Add the client
        let mut game = game.lock().await;
        let outcome = game.game_state.add_player(nickname, client_id);

        // Let everyone else know
        match outcome {
            Outcome::Delta { .. } => {
                for game_client in game.game_state.players.iter() {
                    if game_client.client_id == client_id {
                        continue;
                    }
                    let anonymized = ServerResponse::from_outcome(&outcome, game_client.client_id);
                    let _ = self
                        .send_to_client(game_client.client_id, &anonymized)
                        .await;
                }
            }
            _ => {
                log::error!(
                    "Client {} failed to join game {}: {:?}",
                    client_id,
                    game_id,
                    outcome
                );
                return self
                    .error(client_id, format!("Failed to join game {}.", game_id))
                    .await;
            }
        };

        // Let client know they joined
        let message = ServerResponse::GameJoined {
            game_id,
            game_state: game.game_state.anonymize(client_id),
        };
        self.send_to_client(client_id, &message).await;

        // Update game record
        self.client_map.write().await.insert(client_id, game_id);
        log::info!("Client {} joined game {}.", client_id, game_id);
    }

    pub async fn leave_game(&self, client_id: usize) {
        // Get the game to leave
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

        let mut game = game.lock().await;
        let outcome = game.game_state.remove_player(client_id);

        match outcome {
            Outcome::Delta { .. } => {
                for game_client in game.game_state.players.iter() {
                    let anonymized = ServerResponse::from_outcome(&outcome, game_client.client_id);
                    let _ = self
                        .send_to_client(game_client.client_id, &anonymized)
                        .await;
                }
            }
            _ => {
                log::error!(
                    "Client {} failed to leave game {}: {:?}",
                    client_id,
                    game.game_id,
                    outcome
                );
                return self
                    .error(client_id, format!("Failed to leave game {}.", game.game_id))
                    .await;
            }
        };

        // Let client know they left
        let message = ServerResponse::GameLeft;
        self.send_to_client(client_id, &message).await;

        // Update records
        self.client_map.write().await.remove(&client_id);
        log::info!("Client {} left game {}.", client_id, game.game_id);
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
        self.send_to_game_clients(game_id, &ServerResponse::ChatMessage { client_id, message })
            .await;
        log::info!(
            "Client {} sent a chat message to game {}.",
            client_id,
            game_id
        );
    }
}
