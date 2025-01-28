use serde::{Deserialize, Serialize};

use crate::{component::component::Anonymize, entity::Entity};

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

#[derive(Serialize)]
pub enum AnonHandCard {
    HandCard {
        rank: u8,
        suit: Suit,
        deck_id: DeckId,
    },
    AnonHandCard {
        deck_id: DeckId,
    },
}

#[derive(Serialize)]
pub struct AnonHand {
    nickname: String,
    cards: Vec<AnonHandCard>,
}

impl Anonymize for Hand {
    type Anon = AnonHand;
    fn anonymize(&self, as_entity: Entity, perspective: Entity) -> Self::Anon {
        if as_entity == perspective {
            return AnonHand {
                nickname: self.nickname.clone(),
                cards: self
                    .cards
                    .iter()
                    .map(|c| AnonHandCard::HandCard {
                        rank: c.rank,
                        suit: c.suit.clone(),
                        deck_id: c.deck_id,
                    })
                    .collect(),
            };
        }
        let cards: Vec<_> = self
            .cards
            .iter()
            .map(|card| match card.shown {
                true => AnonHandCard::HandCard {
                    rank: card.rank,
                    suit: card.suit.clone(),
                    deck_id: card.deck_id,
                },
                false => AnonHandCard::AnonHandCard {
                    deck_id: card.deck_id,
                },
            })
            .collect();
        AnonHand {
            nickname: self.nickname.clone(),
            cards: cards,
        }
    }
}
