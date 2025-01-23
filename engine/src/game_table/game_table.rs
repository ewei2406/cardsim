use crate::entity::{Entity, EntityId, EntityPosition};

use super::update::GameTableUpdate;

pub struct GameTable {
    pub entities: Vec<Box<dyn Entity>>,
}

impl GameTable {
    pub fn new() -> Self {
        Self {
            entities: Vec::new(),
        }
    }

    fn add_entity(&mut self, entity: Box<dyn Entity>) {
        self.entities.push(entity);
    }

    fn delete_entity(&mut self, entity_id: EntityId) {
        self.entities.retain(|entity| entity.id() != entity_id);
    }

    fn change_entity(&mut self, entity_id: EntityId, new_entity: Box<dyn Entity>) {
        self.delete_entity(entity_id);
        self.add_entity(new_entity);
    }

    pub fn get_entity(&self, entity_id: EntityId) -> Option<&Box<dyn Entity>> {
        self.entities.iter().find(|entity| entity.id() == entity_id)
    }

    pub fn get_entities_pos(&self, pos: EntityPosition) -> Vec<&Box<dyn Entity>> {
        self.entities
            .iter()
            .filter(|entity| entity.position() == Some(pos))
            .collect()
    }

    pub fn serialize(&self) -> String {
        "Table".to_string()
            + &self
                .entities
                .iter()
                .map(|entity| format!("\n- {}", entity.serialize()))
                .collect::<String>()
    }

    pub fn apply_update(&mut self, update: GameTableUpdate) {
        match update {
            GameTableUpdate::EntityAdded { entity } => {
                self.add_entity(entity);
            }
            GameTableUpdate::EntityDeleted { entity_id } => {
                self.delete_entity(entity_id);
            }
            GameTableUpdate::EntityChanged {
                entity_id,
                new_entity,
            } => {
                self.change_entity(entity_id, new_entity);
            }
        }
    }
}
