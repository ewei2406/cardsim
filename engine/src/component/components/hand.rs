use serde::{Deserialize, Serialize};

use crate::{
    component::{component::Anonymize, GroupedComponent},
    entity::Entity,
};

use super::{card::Suit, deck::DeckId};

pub type HandCardId = usize;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HandCard {
    pub id: HandCardId,
    pub rank: u8,
    pub suit: Suit,
    pub shown: bool,
    pub deck_id: DeckId,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Hand {
    pub nickname: String,
    pub cards: Vec<HandCard>,
}

impl GroupedComponent for Hand {
    type Params = String;
    fn add(gamestate: &mut crate::gamestate::GameState, params: Self::Params) -> Entity {
        let entity = gamestate.get_entity();
        gamestate.hands.register(
            entity,
            Hand {
                nickname: params,
                cards: Vec::new(),
            },
        );
        entity
    }

    fn remove(gamestate: &mut crate::gamestate::GameState, entity: Entity) {
        gamestate.hands.unregister(entity);
    }
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
