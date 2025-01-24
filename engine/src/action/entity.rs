use crate::{component::Position, entity::Entity, gamestate::GameState};

pub fn move_entity(gamestate: &mut GameState, entity: Entity, position: Position) {
    if let None = gamestate.positions.get(entity) {
        return;
    }
    gamestate.positions.register(entity, position);
}
