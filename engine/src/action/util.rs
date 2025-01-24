use crate::{component::Position, gamestate::GameState};

pub fn empty_deck_position(gamestate: &GameState) -> Position {
    let mut position = Position {
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
    };
    while gamestate.decks.has(|entity, _| {
        if let Some(pos) = gamestate.positions.get(entity) {
            pos.x == position.x && pos.y == position.y
        } else {
            false
        }
    }) {
        position.x += 1;
    }
    position
}

pub fn empty_position(gamestate: &GameState) -> Position {
    let mut position = Position {
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
    };
    while gamestate
        .positions
        .has(|_, pos| pos.x == position.x && pos.y == position.y)
    {
        position.x += 1;
    }
    position
}
