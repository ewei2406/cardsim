use rand::{seq::SliceRandom, thread_rng};
use serde::{Deserialize, Serialize};

use super::card::Suit::{self, *};

pub type DeckId = usize;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CardInit {
    pub suit: Suit,
    pub rank: u8,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Deck {
    pub deck_id: DeckId,
    pub card_inits: Vec<CardInit>,
}

impl Deck {
    pub fn new(deck_id: DeckId) -> Self {
        let mut cards = Vec::new();

        for suit in [Clubs, Diamonds, Spades, Hearts].iter() {
            for rank in 1..=13 {
                cards.push(CardInit {
                    suit: suit.clone(),
                    rank,
                });
            }
        }
        cards.push(CardInit {
            suit: Joker,
            rank: 14,
        });
        cards.push(CardInit {
            suit: Joker,
            rank: 15,
        });

        Self {
            deck_id,
            card_inits: cards,
        }
    }

    pub fn return_card(&mut self, card_init: CardInit) {
        self.card_inits.push(CardInit {
            suit: card_init.suit,
            rank: card_init.rank,
        });
    }

    pub fn draw_card(&mut self) -> Option<CardInit> {
        self.card_inits.pop()
    }

    pub fn shuffle(&mut self) {
        self.card_inits.shuffle(&mut thread_rng());
    }
}
