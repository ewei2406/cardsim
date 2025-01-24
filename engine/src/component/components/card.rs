use serde::{Deserialize, Serialize};

use crate::{entity::Entity, gamestate::GameState};

use super::{deck::DeckId, Position};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Suit {
    Clubs,
    Diamonds,
    Hearts,
    Spades,
    Joker,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Card {
    pub rank: u8,
    pub suit: Suit,
    pub faceup: bool,
    pub deck_id: DeckId,
}

impl Card {
    pub fn add_card(gamestate: &mut GameState, card: Card, position: Position) -> Entity {
        let entity = gamestate.get_entity();
        gamestate.cards.register(entity, card);
        gamestate.positions.register(entity, position);
        entity
    }
}
