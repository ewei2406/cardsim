use rand::{seq::SliceRandom, thread_rng};
use serde::{Deserialize, Serialize};

use crate::{
    component::component::{Anonymize, GroupedComponent},
    entity::Entity,
    gamestate::GameState,
};

use super::{card::Suit, Position};

pub type DeckId = usize;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CardInit(pub Suit, pub u8, pub Entity);

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Deck {
    pub deck_id: DeckId,
    pub card_inits: Vec<CardInit>,
    pub shuffle_ctr: usize,
}

impl Deck {
    pub fn new(deck_id: DeckId, card_inits: Vec<CardInit>) -> Self {
        Self {
            deck_id,
            card_inits,
            shuffle_ctr: 0,
        }
    }

    pub fn return_card(&mut self, card_init: CardInit) {
        self.card_inits.push(card_init);
    }

    pub fn draw_card(&mut self) -> Option<CardInit> {
        self.card_inits.pop()
    }

    pub fn shuffle(&mut self) {
        self.card_inits.shuffle(&mut thread_rng());
        self.shuffle_ctr += 1;
    }
}

impl GroupedComponent for Deck {
    type Params = (Deck, Position);
    fn add_id(gamestate: &mut GameState, params: Self::Params, id: Entity) {
        gamestate.decks.register(id, params.0);
        gamestate.positions.register(id, params.1);
    }
    fn add(gamestate: &mut GameState, params: Self::Params) -> Entity {
        let entity = gamestate.get_entity();
        Self::add_id(gamestate, params, entity);
        entity
    }
    fn remove(gamestate: &mut GameState, entity: Entity) {
        gamestate.decks.unregister(entity);
        gamestate.positions.unregister(entity);
    }
}

#[derive(Serialize, Debug)]
pub struct AnonDeck {
    pub deck_id: DeckId,
    pub card_count: usize,
    pub next_card: Entity,
    pub shuffle_ctr: usize,
}

impl Anonymize for Deck {
    type Anon = AnonDeck;
    fn anonymize(&self, _as_entity: Entity, _perspective: Entity) -> Self::Anon {
        AnonDeck {
            next_card: self.card_inits.last().map(|x| x.2).unwrap_or(0),
            deck_id: self.deck_id,
            card_count: self.card_inits.len(),
            shuffle_ctr: self.shuffle_ctr,
        }
    }
}
