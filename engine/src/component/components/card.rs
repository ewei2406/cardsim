use serde::{Deserialize, Serialize};

use crate::{component::component::Anonymize, entity::Entity, gamestate::GameState};

use super::{deck::DeckId, Position};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Suit {
    C,
    D,
    H,
    S,
    J,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Card {
    pub suit: Suit,
    pub rank: u8,
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

#[derive(Serialize)]
pub enum AnonCard {
    Card {
        suit: Suit,
        rank: u8,
        deck_id: DeckId,
    },
    AnonCard {
        deck_id: DeckId,
    },
}

impl Anonymize for Card {
    type Anon = AnonCard;
    fn anonymize(&self, _as_entity: Entity, _perspective: Entity) -> Self::Anon {
        match self.faceup {
            true => AnonCard::Card {
                suit: self.suit.clone(),
                rank: self.rank,
                deck_id: self.deck_id,
            },
            false => AnonCard::AnonCard {
                deck_id: self.deck_id,
            },
        }
    }
}
