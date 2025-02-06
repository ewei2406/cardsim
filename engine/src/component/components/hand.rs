use serde::{Deserialize, Serialize};

use crate::{
    component::{component::Anonymize, GroupedComponent},
    connection_manager::ConnectionId,
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
    pub client_id: ConnectionId,
    pub nickname: String,
    pub cards: Vec<HandCard>,
}

impl GroupedComponent for Hand {
    type Params = Hand;
    fn add_id(gamestate: &mut crate::gamestate::GameState, params: Self::Params, id: Entity) {
        gamestate.entities.insert(id);
        gamestate.hands.register(id, params);
    }
    fn add(gamestate: &mut crate::gamestate::GameState, params: Self::Params) -> Entity {
        let entity = gamestate.get_entity();
        gamestate.hands.register(entity, params);
        entity
    }
    fn remove(gamestate: &mut crate::gamestate::GameState, entity: Entity) {
        gamestate.hands.unregister(entity);
        gamestate.entities.remove(&entity);
    }
}

#[derive(Serialize, Debug)]
#[serde(tag = "type")]
pub enum AnonHandCard {
    Visible {
        id: HandCardId,
        rank: u8,
        suit: Suit,
        deck_id: DeckId,
        shown: bool,
    },
    Hidden {
        id: HandCardId,
        deck_id: DeckId,
    },
}

#[derive(Serialize, Debug)]
pub struct AnonHand {
    client_id: ConnectionId,
    nickname: String,
    cards: Vec<AnonHandCard>,
}

impl Anonymize for Hand {
    type Anon = AnonHand;
    fn anonymize(&self, as_entity: Entity, perspective: Entity) -> Self::Anon {
        log::debug!(
            "Anonymizing hand: {:?} as {:?} from {:?}",
            self, as_entity, perspective
        );
        if self.client_id == perspective {
            return AnonHand {
                nickname: self.nickname.clone(),
                client_id: self.client_id,
                cards: self
                    .cards
                    .iter()
                    .map(|c| AnonHandCard::Visible {
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
                true => AnonHandCard::Visible {
                    id: card.id,
                    shown: card.shown,
                    rank: card.rank,
                    suit: card.suit.clone(),
                    deck_id: card.deck_id,
                },
                false => AnonHandCard::Hidden {
                    id: card.id,
                    deck_id: card.deck_id,
                },
            })
            .collect();
        AnonHand {
            nickname: self.nickname.clone(),
            client_id: self.client_id,
            cards: cards,
        }
    }
}
