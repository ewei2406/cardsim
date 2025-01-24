use serde_json::json;

use crate::{component::*, entity::Entity};

pub struct GameState {
    next_id: Entity,
    pub positions: ComponentStorage<Position>,
    pub cards: ComponentStorage<Card>,
    pub decks: ComponentStorage<Deck>,
    pub hands: ComponentStorage<Hand>,
    pub dead: ComponentStorage<Dead>,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            next_id: 0,
            positions: ComponentStorage::new(),
            cards: ComponentStorage::new(),
            decks: ComponentStorage::new(),
            hands: ComponentStorage::new(),
            dead: ComponentStorage::new(),
        }
    }

    pub fn get_entity(&mut self) -> Entity {
        let entity = self.next_id;
        self.next_id += 1;
        entity
    }

    pub fn add_hand(&mut self, hand: Hand) -> Entity {
        let entity = self.get_entity();
        self.hands.register(entity, hand);
        entity
    }

    pub fn add_deck(&mut self, deck: Deck, position: Position) -> Entity {
        let entity = self.get_entity();
        self.decks.register(entity, deck);
        self.positions.register(entity, position);
        entity
    }

    pub fn add_card(&mut self, card: Card, position: Position) -> Entity {
        let entity = self.get_entity();
        self.cards.register(entity, card);
        self.positions.register(entity, position);
        entity
    }

    pub fn mark_dead(&mut self, entity: Entity) {
        self.dead.register(entity, Dead);
    }

    pub fn describe(&self) -> String {
        let state = json!({
            "positions": self.positions.describe(),
            "cards": self.cards.describe(),
            "decks": self.decks.describe(),
            "hands": self.hands.describe(),
        });
        state.to_string()
    }
}
