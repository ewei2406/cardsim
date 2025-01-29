use std::collections::HashSet;

use crate::{component::*, entity::Entity, util::get_id};
use serde::Serialize;

#[derive(Serialize)]
pub struct GameState {
    pub entities: HashSet<Entity>,
    pub positions: ComponentStorage<Position>,
    pub cards: ComponentStorage<Card>,
    pub decks: ComponentStorage<Deck>,
    pub hands: ComponentStorage<Hand>,
}

#[derive(Serialize)]
pub struct AnonGameState {
    pub entities: HashSet<Entity>,
    pub positions: ComponentStorage<Position>,
    pub cards: ComponentStorage<AnonCard>,
    pub decks: ComponentStorage<AnonDeck>,
    pub hands: ComponentStorage<AnonHand>,
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

    pub fn remove_entity(&mut self, entity: Entity) {
        self.positions.unregister(entity);
        self.cards.unregister(entity);
        self.decks.unregister(entity);
        self.hands.unregister(entity);
        self.entities.remove(&entity);
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

    pub fn anonymize(&self, perspective: Entity) -> AnonGameState {
        AnonGameState {
            entities: self.entities.clone(),
            positions: self.positions.anonymize(perspective),
            cards: self.cards.anonymize(perspective),
            decks: self.decks.anonymize(perspective),
            hands: self.hands.anonymize(perspective),
        }
    }
}
