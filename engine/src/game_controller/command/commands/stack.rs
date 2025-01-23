use crate::entity;
use crate::game_table;

pub fn move_stack(
    table: &game_table::GameTable,
    depth: u64,
    pos: entity::EntityPosition,
    target_pos: entity::EntityPosition,
) -> Result<Vec<game_table::GameTableUpdate>, String> {
    let entities = table.get_entities_pos(pos);
    let mut updates = Vec::new();
    for (i, entity) in entities.iter().enumerate() {
        if i as u64 >= depth {
            break;
        }
        let mut entity = entity.duplicate();
        entity.update_position(target_pos);
        updates.push(game_table::GameTableUpdate::EntityChanged {
            entity_id: entity.id(),
            new_entity: entity,
        });
    }
    Ok(updates)
}

pub fn delete_stack(
    table: &game_table::GameTable,
    depth: u64,
    pos: entity::EntityPosition,
) -> Result<Vec<game_table::GameTableUpdate>, String> {
    let entities = table.get_entities_pos(pos);
    let mut updates = Vec::new();
    for (i, entity) in entities.iter().enumerate() {
        if i as u64 >= depth {
            break;
        }
        updates.push(game_table::GameTableUpdate::EntityDeleted {
            entity_id: entity.id(),
        });
    }
    Ok(updates)
}
