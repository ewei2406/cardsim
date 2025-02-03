use serde::{Deserialize, Serialize};

use crate::{
    component::{CardInit, DeckId, HandCardId},
    connection_manager::ConnectionId,
    entity::Entity,
    gamestate::GameState,
};

use super::{deck::*, entity::*, hand::*};
use crate::Action::*;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "action")]
pub enum Action {
    CreateDeck {
        x: i64,
        y: i64,
        card_inits: Vec<CardInit>,
    },
    CreateStandardDecks {
        x: i64,
        y: i64,
        n: usize,
        jokers: bool,
    },
    CutDeck {
        deck: Entity,
        n: usize,
    },
    FlipCardsFromDeck {
        faceup: bool,
        deck: Entity,
        n: usize,
    },
    ShuffleDeck {
        deck: Entity,
    },
    CollectDeck {
        deck_id: DeckId,
        x1: i64,
        y1: i64,
    },
    DrawCardFromTable {
        card: Entity,
    },
    DrawCardsFromLocation {
        x: i64,
        y: i64,
    },
    DrawCardFromDeck {
        deck: Entity,
    },
    MoveEntity {
        entity: Entity,
        x1: i64,
        y1: i64,
    },
    RemoveEntity {
        entity: Entity,
    },
    PlayHandCards {
        cards: Vec<HandCardId>,
        x: i64,
        y: i64,
        faceup: bool,
    },
    PlayHandCardsToDeck {
        cards: Vec<HandCardId>,
        deck: Entity,
    },
    ShowHandCards {
        cards: Vec<HandCardId>,
        shown: bool,
    },
}

#[derive(Serialize, Debug)]
pub enum InvalidOutcomeError {
    EntityNotFound,
    InvalidEntityState,
    InvalidTarget,
}

#[derive(Serialize, Debug)]
pub enum Outcome {
    Delta {
        changed: Option<GameState>,
        deleted: Option<Vec<Entity>>,
    },
    None,
    Invalid(InvalidOutcomeError),
}

pub trait Actionable {
    fn apply(&mut self, action: Action, client_id: ConnectionId) -> Outcome;
}

impl Actionable for GameState {
    fn apply(&mut self, action: Action, client_id: ConnectionId) -> Outcome {
        match action {
            CreateDeck { x, y, card_inits } => create_deck(self, x, y, card_inits),
            CreateStandardDecks { x, y, n, jokers } => create_standard_decks(self, x, y, n, jokers),
            CutDeck { deck, n } => cut_deck(self, deck, n),
            FlipCardsFromDeck { deck, n, faceup } => flip_cards_from_deck(self, deck, n, faceup),
            ShuffleDeck { deck } => shuffle_deck(self, deck),
            MoveEntity { entity, x1, y1 } => move_entity(self, entity, x1, y1),
            RemoveEntity { entity } => remove_entity(self, entity),
            CollectDeck { deck_id, x1, y1 } => collect_deck(self, deck_id, x1, y1),
            DrawCardFromTable { card } => draw_card_from_table(self, client_id, card),
            DrawCardFromDeck { deck } => draw_card_from_deck(self, client_id, deck),
            PlayHandCards {
                cards,
                x,
                y,
                faceup,
            } => play_hand_cards(self, client_id, cards, x, y, faceup),
            // RemoveHand => remove_hand(self, client_id),
            DrawCardsFromLocation { x, y } => draw_cards_from_location(self, client_id, x, y),
            ShowHandCards { cards, shown } => show_hand_cards(self, client_id, cards, shown),
            PlayHandCardsToDeck { cards, deck } => {
                play_hand_cards_to_deck(self, client_id, cards, deck)
            }
        }
    }
}
