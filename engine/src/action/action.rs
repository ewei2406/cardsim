use serde::{Deserialize, Serialize};

use crate::{entity::Entity, gamestate::GameState};

use super::deck::*;

#[derive(Serialize, Deserialize, Clone)]
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

#[derive(Serialize)]
pub enum Outcome {
    Delta {
        changed: GameState,
        deleted: Vec<Entity>,
    },
    None,
}

pub trait Actionable {
    fn apply(&mut self, action: Action) -> Outcome;
}

impl Actionable for GameState {
    fn apply(&mut self, action: Action) -> Outcome {
        match action {
            Action::CreateDeck { x, y } => create_deck(self, x, y),
            Action::CutDeck { entity, n, x1, y1 } => cut_deck(self, entity, n, x1, y1),
            Action::FlipCardsFromDeck { entity, n, x1, y1 } => {
                flip_cards_from_deck(self, entity, n, x1, y1)
            }
            Action::ShuffleDeck { entity } => shuffle_deck(self, entity),
        }
    }
}
