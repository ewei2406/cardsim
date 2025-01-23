use crate::game_table;

pub fn move_entity(
    table: &game_table::GameTable,
    id: u64,
    pos: (u64, u64),
) -> Result<Vec<game_table::GameTableUpdate>, String> {
    let entity = table.get_entity(id);
    if let None = entity {
        return Err("Entity not found".to_string());
    }
    let mut entity = entity.unwrap().duplicate();
    entity.update_position(pos);
    let update = game_table::GameTableUpdate::EntityChanged {
        entity_id: id,
        new_entity: entity,
    };
    Ok(vec![update])
}

pub fn delete_entity(id: u64) -> Result<Vec<game_table::GameTableUpdate>, String> {
    Ok(vec![game_table::GameTableUpdate::EntityDeleted {
        entity_id: id,
    }])
}
