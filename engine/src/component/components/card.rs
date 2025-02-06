use serde::{Deserialize, Serialize};

use crate::{
    component::component::{Anonymize, GroupedComponent},
    entity::Entity,
    gamestate::GameState,
};

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

impl GroupedComponent for Card {
    type Params = (Card, Position);
    fn add_id(gamestate: &mut GameState, params: Self::Params, id: Entity) {
        gamestate.entities.insert(id);
        gamestate.cards.register(id, params.0);
        gamestate.positions.register(id, params.1);
    }
    fn add(gamestate: &mut GameState, params: Self::Params) -> Entity {
        let entity = gamestate.get_entity();
        Self::add_id(gamestate, params, entity);
        entity
    }
    fn remove(gamestate: &mut GameState, entity: Entity) {
        gamestate.cards.unregister(entity);
        gamestate.positions.unregister(entity);
        gamestate.entities.remove(&entity);
    }
}

#[derive(Serialize, Debug)]
#[serde(tag = "type")]
pub enum AnonCard {
    Visible {
        suit: Suit,
        rank: u8,
        deck_id: DeckId,
    },
    Hidden {
        deck_id: DeckId,
    },
}

impl Anonymize for Card {
    type Anon = AnonCard;
    fn anonymize(&self, _as_entity: Entity, _perspective: Entity) -> Self::Anon {
        match self.faceup {
            true => AnonCard::Visible {
                suit: self.suit.clone(),
                rank: self.rank,
                deck_id: self.deck_id,
            },
            false => AnonCard::Hidden {
                deck_id: self.deck_id,
            },
        }
    }
}
