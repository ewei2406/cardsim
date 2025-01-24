use serde::{Deserialize, Serialize};

use super::deck::DeckId;

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
