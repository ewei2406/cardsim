use crate::{entity::Entity, gamestate::GameState};

use super::{action::InvalidOutcomeError, Outcome};

pub fn move_entity(gamestate: &mut GameState, entity: Entity, x1: i64, y1: i64) -> Outcome {
    if let None = gamestate.positions.get(entity) {
        return Outcome::None;
    }
    gamestate
        .positions
        .register(entity, gamestate.nearest_empty_position(x1, y1));
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, entity);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
    }
}

pub fn move_entities(
    gamestate: &mut GameState,
    entities: Vec<Entity>,
    x1: i64,
    y1: i64,
) -> Outcome {
    let mut dstate = GameState::new();
    for entity in entities {
        if let None = gamestate.positions.get(entity) {
            continue;
        }
        gamestate
            .positions
            .register(entity, gamestate.nearest_empty_position(x1, y1));
        dstate.clone_entity_from(gamestate, entity);
    }
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
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
        players: None,
    }
}

pub fn remove_entities(gamestate: &mut GameState, entities: Vec<Entity>) -> Outcome {
    // Can't remove hands
    if entities
        .iter()
        .any(|entity| gamestate.hands.get(*entity).is_some())
    {
        return Outcome::Invalid(InvalidOutcomeError::InvalidTarget);
    }

    for entity in &entities {
        gamestate.remove_entity(*entity);
    }
    Outcome::Delta {
        changed: None,
        deleted: Some(entities),
        players: None,
    }
}
