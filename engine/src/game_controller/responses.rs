use serde::Serialize;

use crate::{
    action::Outcome, connection_manager::ConnectionId, entity::Entity, gamestate::AnonGameState,
};

use super::{GameDesc, GameId};

#[derive(Serialize, Debug)]
#[serde(tag = "type")]
pub enum ServerResponse {
    AvailableGames {
        games: Vec<GameDesc>,
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
    GameCreated {
        game_id: GameId,
    },
    GameJoined {
        game_id: GameId,
		game_state: AnonGameState,
    },
    GameLeft,
}

impl ServerResponse {
    pub fn from_outcome(outcome: &Outcome, perspective: ConnectionId) -> Self {
        match outcome {
            Outcome::Delta { changed, deleted } => ServerResponse::Delta {
                changed: changed.as_ref().map(|gs| gs.anonymize(perspective)),
                deleted: deleted.clone(),
            },
            Outcome::Invalid(err) => ServerResponse::Error {
                message: format!("{:?}", err),
            },
            Outcome::None => ServerResponse::Ok,
        }
    }
}
