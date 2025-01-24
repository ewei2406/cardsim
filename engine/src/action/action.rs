use serde::Serialize;

use crate::{entity::Entity, gamestate::GameState};

use super::deck::*;

#[derive(Serialize)]
#[serde(tag = "action")]
pub enum Action {
    CreateDeck {
        x: i64,
        y: i64,
    },
    CutDeck {
        entity: Entity,
        n: usize,
        x1: i64,
        y1: i64,
    },
    FlipCardsFromDeck {
        entity: Entity,
        n: usize,
        x1: i64,
        y1: i64,
    },
    ShuffleDeck {
        entity: Entity,
    },
}

pub enum Outcome {
    Changed(Vec<Entity>),
    None,
}

pub trait Actionable {
    fn apply(&self, gamestate: &mut GameState) -> Outcome;
}

impl Actionable for Action {
    fn apply(&self, gamestate: &mut GameState) -> Outcome {
        match self {
            Action::CreateDeck { x, y } => create_deck(gamestate, *x, *y),
            Action::CutDeck { entity, n, x1, y1 } => cut_deck(gamestate, *entity, *n, *x1, *y1),
            Action::FlipCardsFromDeck { entity, n, x1, y1 } => {
                flip_cards_from_deck(gamestate, *entity, *n, *x1, *y1)
            }
            Action::ShuffleDeck { entity } => shuffle_deck(gamestate, *entity),
        }
    }
}
