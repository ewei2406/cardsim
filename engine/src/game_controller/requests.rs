use serde::Deserialize;

use crate::action::Action;

use super::GameId;

#[derive(Deserialize, Debug)]
#[serde(tag = "command")]
pub enum Command {
    ListGames,
    CreateGame { nickname: String },
    JoinGame { game_id: GameId, nickname: String },
    ChatMessage { message: String },
    LeaveGame,
}

#[derive(Deserialize, Debug)]
#[serde(tag = "type")]
pub enum ClientRequest {
    Action(Action),
    Command(Command),
}
