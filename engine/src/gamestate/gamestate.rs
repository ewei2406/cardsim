use std::collections::HashSet;

use serde::Serialize;

use crate::{component::*, entity::Entity, util::get_id};

#[derive(Serialize)]
pub struct GameState {
    pub entities: HashSet<Entity>,
    pub positions: ComponentStorage<Position>,
    pub cards: ComponentStorage<Card>,
    pub decks: ComponentStorage<Deck>,
    pub hands: ComponentStorage<Hand>,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            entities: HashSet::new(),
            positions: ComponentStorage::new(),
            cards: ComponentStorage::new(),
            decks: ComponentStorage::new(),
            hands: ComponentStorage::new(),
        }
    }

    pub fn get_entity(&mut self) -> Entity {
        let entity = get_id();
        self.entities.insert(entity);
        entity
    }
}
