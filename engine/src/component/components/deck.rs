use rand::{seq::SliceRandom, thread_rng};
use serde::{Deserialize, Serialize};

use crate::{component::component::Anonymize, entity::Entity, gamestate::GameState};

use super::{
    card::Suit::{self, *},
    Position,
};

pub type DeckId = usize;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CardInit(pub Suit, pub u8);

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Deck {
    pub deck_id: DeckId,
    pub card_inits: Vec<CardInit>,
}

impl Deck {
    pub fn new(deck_id: DeckId) -> Self {
        let mut cards = Vec::new();

        for suit in [C, D, S, H].iter() {
            for rank in 1..=13 {
                cards.push(CardInit(suit.clone(), rank as u8))
            }
        }
        cards.push(CardInit(Suit::J, 14));
        cards.push(CardInit(Suit::J, 15));

        Self {
            deck_id,
            card_inits: cards,
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
    }

    pub fn add_deck(gamestate: &mut GameState, deck: Deck, position: Position) -> Entity {
        let entity = gamestate.get_entity();
        gamestate.decks.register(entity, deck);
        gamestate.positions.register(entity, position);
        entity
    }
}

#[derive(Serialize)]
pub struct AnonDeck {
    pub deck_id: DeckId,
    pub card_count: usize,
}

impl Anonymize for Deck {
    type Anon = AnonDeck;
    fn anonymize(&self, _as_entity: Entity, _perspective: Entity) -> Self::Anon {
        AnonDeck {
            deck_id: self.deck_id,
            card_count: self.card_inits.len(),
        }
    }
}
