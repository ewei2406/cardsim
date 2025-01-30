use crate::{component::Position, entity::Entity, gamestate::GameState};

use super::{action::InvalidOutcomeError, Outcome};

pub fn move_entity(gamestate: &mut GameState, entity: Entity, x1: i64, y1: i64) -> Outcome {
    if let None = gamestate.positions.get(entity) {
        return Outcome::None;
    }
    gamestate.positions.register(
        entity,
        Position {
            x: x1,
            y: y1,
            z: 0,
            rotation: 0,
        },
    );
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, entity);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
    }
}

pub fn remove_entity(gamestate: &mut GameState, entity: Entity) -> Outcome {
    // Can't remove hands
    if gamestate.hands.get(entity).is_some() {
        return Outcome::Invalid(InvalidOutcomeError::InvalidTarget);
    }

    gamestate.remove_entity(entity);
    Outcome::Delta {
        changed: None,
        deleted: Some(vec![entity]),
    }
}
