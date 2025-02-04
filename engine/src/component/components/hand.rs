use log::info;
use serde::{Deserialize, Serialize};

use crate::{
    component::{component::Anonymize, GroupedComponent},
    connection_manager::ConnectionId,
    entity::Entity,
    util,
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
    pub client_id: ConnectionId,
    pub nickname: String,
    pub order: usize,
    pub cards: Vec<HandCard>,
}

impl GroupedComponent for Hand {
    type Params = (ConnectionId, String);
    fn add(gamestate: &mut crate::gamestate::GameState, params: Self::Params) -> Entity {
        let entity = gamestate.get_entity();
        gamestate.hands.register(
            entity,
            Hand {
                client_id: params.0,
                nickname: params.1,
                // TODO: replace - this assumes this is always ascending.
                order: util::get_id(),
                cards: Vec::new(),
            },
        );
        entity
    }

    fn remove(gamestate: &mut crate::gamestate::GameState, entity: Entity) {
        gamestate.hands.unregister(entity);
    }
}

#[derive(Serialize, Debug)]
#[serde(tag = "type")]
pub enum AnonHandCard {
    HandCard {
        id: HandCardId,
        rank: u8,
        suit: Suit,
        deck_id: DeckId,
        shown: bool,
    },
    AnonHandCard {
        id: HandCardId,
        deck_id: DeckId,
    },
}

#[derive(Serialize, Debug)]
pub struct AnonHand {
    client_id: ConnectionId,
    nickname: String,
    order: usize,
    cards: Vec<AnonHandCard>,
}

impl Anonymize for Hand {
    type Anon = AnonHand;
    fn anonymize(&self, as_entity: Entity, perspective: Entity) -> Self::Anon {
        info!(
            "Anonymizing hand: {:?} as {:?} from {:?}",
            self, as_entity, perspective
        );
        if self.client_id == perspective {
            return AnonHand {
                nickname: self.nickname.clone(),
                order: self.order,
                client_id: self.client_id,
                cards: self
                    .cards
                    .iter()
                    .map(|c| AnonHandCard::HandCard {
                        id: c.id,
                        shown: c.shown,
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
                    id: card.id,
                    shown: card.shown,
                    rank: card.rank,
                    suit: card.suit.clone(),
                    deck_id: card.deck_id,
                },
                false => AnonHandCard::AnonHandCard {
                    id: card.id,
                    deck_id: card.deck_id,
                },
            })
            .collect();
        AnonHand {
            nickname: self.nickname.clone(),
            order: self.order,
            client_id: self.client_id,
            cards: cards,
        }
    }
}
