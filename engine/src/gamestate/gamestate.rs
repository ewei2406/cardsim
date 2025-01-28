use std::collections::HashSet;

use serde::Serialize;

use crate::{
    component::*,
    entity::{self, Entity},
    util::get_id,
};

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

    pub fn clone_entity_from(&mut self, other: &mut GameState, entity: Entity) {
        self.entities.insert(entity);
        self.positions
            .clone_component_from(&mut other.positions, entity);
        self.cards.clone_component_from(&mut other.cards, entity);
        self.decks.clone_component_from(&mut other.decks, entity);
        self.hands.clone_component_from(&mut other.hands, entity);
    }
}
