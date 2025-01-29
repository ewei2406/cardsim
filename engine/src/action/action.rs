use serde::{Deserialize, Serialize};

use crate::{
    component::{CardInit, DeckId, HandCardId},
    connection_manager::ConnectionId,
    entity::Entity,
    gamestate::GameState,
};

use super::{deck::*, entity::*, hand::*};
use crate::Action::*;

#[derive(Serialize, Deserialize, Clone)]
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
        x1: i64,
        y1: i64,
    },
    FlipCardsFromDeck {
        deck: Entity,
        n: usize,
        x1: i64,
        y1: i64,
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
        hand: Entity,
        card: Entity,
    },
    DrawCardsFromLocation {
        hand: Entity,
        x: i64,
        y: i64,
    },
    DrawCardFromDeck {
        hand: Entity,
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
    AddHand {
        client_id: ConnectionId,
        nickname: String,
    },
    PlayHandCards {
        hand: Entity,
        cards: Vec<HandCardId>,
        x: i64,
        y: i64,
        faceup: bool,
    },
    PlayHandCardsToDeck {
        hand: Entity,
        cards: Vec<HandCardId>,
        deck: Entity,
    },
    ShowHandCards {
        hand: Entity,
        cards: Vec<HandCardId>,
        shown: bool,
    },
    RemoveHand {
        client_id: ConnectionId,
    },
}

#[derive(Serialize, Debug)]
pub enum InvalidOutcomeError {
    EntityNotFound,
    InvalidEntityState,
}

#[derive(Serialize)]
pub enum Outcome {
    Delta {
        changed: Option<GameState>,
        deleted: Option<Vec<Entity>>,
    },
    None,
    Invalid(InvalidOutcomeError),
}

pub trait Actionable {
    fn apply(&mut self, action: Action) -> Outcome;
}

impl Actionable for GameState {
    fn apply(&mut self, action: Action) -> Outcome {
        match action {
            CreateDeck { x, y, card_inits } => create_deck(self, x, y, card_inits),
            CreateStandardDecks { x, y, n, jokers } => create_standard_decks(self, x, y, n, jokers),
            CutDeck { deck, n, x1, y1 } => cut_deck(self, deck, n, x1, y1),
            FlipCardsFromDeck { deck, n, x1, y1 } => flip_cards_from_deck(self, deck, n, x1, y1),
            ShuffleDeck { deck } => shuffle_deck(self, deck),
            MoveEntity { entity, x1, y1 } => move_entity(self, entity, x1, y1),
            RemoveEntity { entity } => remove_entity(self, entity),
            CollectDeck { deck_id, x1, y1 } => collect_deck(self, deck_id, x1, y1),
            DrawCardFromTable { hand, card } => draw_card_from_table(self, hand, card),
            DrawCardFromDeck { hand, deck } => draw_card_from_deck(self, hand, deck),
            AddHand {
                nickname,
                client_id,
            } => add_hand(self, nickname, client_id),
            PlayHandCards {
                hand,
                cards,
                x,
                y,
                faceup,
            } => play_hand_cards(self, hand, cards, x, y, faceup),
            RemoveHand { client_id } => remove_hand(self, client_id),
            DrawCardsFromLocation { hand, x, y } => draw_cards_from_location(self, hand, x, y),
            ShowHandCards { hand, cards, shown } => show_hand_cards(self, hand, cards, shown),
            PlayHandCardsToDeck { hand, cards, deck } => {
                play_hand_cards_to_deck(self, hand, cards, deck)
            }
        }
    }
}
