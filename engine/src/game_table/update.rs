use crate::entity::{deserialize, Entity, EntityId};

pub enum GameTableUpdate {
    EntityAdded {
        entity: Box<dyn Entity>,
    },
    EntityDeleted {
        entity_id: EntityId,
    },
    EntityChanged {
        entity_id: EntityId,
        new_entity: Box<dyn Entity>,
    },
}

impl GameTableUpdate {
    pub fn serialize(&self) -> String {
        match self {
            GameTableUpdate::EntityAdded { entity } => {
                format!("add,{}", entity.serialize())
            }
            GameTableUpdate::EntityDeleted { entity_id } => {
                format!("delete,{}", entity_id)
            }
            GameTableUpdate::EntityChanged {
                entity_id,
                new_entity,
            } => {
                format!("change,{},{}", entity_id, new_entity.serialize())
            }
        }
    }

    pub fn deserialize(update: String) -> Result<GameTableUpdate, String> {
        let parts = update.split_once(',');
        let (update_type, data) = match parts {
            Some((update_type, data)) => (update_type, data),
            None => return Err("Invalid update".to_string()),
        };

        match update_type {
            "add" => {
                let entity = deserialize(data.to_string())?;
                Ok(GameTableUpdate::EntityAdded { entity })
            }
            "delete" => {
                let id = data
                    .parse::<EntityId>()
                    .map_err(|_| "Invalid entity ID".to_string())?;
                Ok(GameTableUpdate::EntityDeleted { entity_id: id })
            }
            "change" => {
                let parts = data.split_once(',');
                let (entity_id, data) = match parts {
                    Some((id, data)) => (id, data),
                    None => return Err("Invalid change update".to_string()),
                };
                let entity_id = entity_id
                    .parse::<EntityId>()
                    .map_err(|_| "Invalid entity ID".to_string())?;
                let new_entity = deserialize(data.to_string())?;
                Ok(GameTableUpdate::EntityChanged {
                    entity_id,
                    new_entity,
                })
            }
            _ => Err("Unknown update type".to_string()),
        }
    }
}
