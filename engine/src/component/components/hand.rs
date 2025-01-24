use serde::{Deserialize, Serialize};

use super::{card::Suit, deck::DeckId};

#[derive(Serialize, Deserialize, Clone, Debug)]
struct HandCard {
    rank: u8,
    suit: Suit,
    shown: bool,
    deck_id: DeckId,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Hand {
    nickname: String,
    cards: Vec<HandCard>,
}
