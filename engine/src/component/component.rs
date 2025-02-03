use std::{collections::HashMap, fmt::Debug};

use serde::Serialize;

use crate::{entity::Entity, gamestate::GameState};

#[derive(Serialize, Debug, Clone)]
#[serde(transparent)]
pub struct ComponentStorage<T> {
    components: HashMap<Entity, T>,
}

pub trait Anonymize {
    type Anon;
    fn anonymize(&self, as_entity: Entity, perspective: Entity) -> Self::Anon;
}

pub trait GroupedComponent {
    type Params;
    fn add(gamestate: &mut GameState, params: Self::Params) -> Entity;
    fn remove(gamestate: &mut GameState, entity: Entity);
}

impl<T: Clone + Debug + Serialize + Anonymize> ComponentStorage<T> {
    pub fn new() -> Self {
        Self {
            components: HashMap::new(),
        }
    }

    pub fn register(&mut self, entity: Entity, component: T) {
        self.components.insert(entity, component);
    }

    pub fn unregister(&mut self, entity: Entity) {
        self.components.remove(&entity);
    }

    pub fn get(&self, entity: Entity) -> Option<&T> {
        self.components.get(&entity)
    }

    pub fn get_mut(&mut self, entity: Entity) -> Option<&mut T> {
        self.components.get_mut(&entity)
    }

    pub fn get_entity_match(&self, filter: impl Fn(&T) -> bool) -> Option<Entity> {
        self.components.iter().find_map(|(entity, component)| {
            if filter(component) {
                Some(*entity)
            } else {
                None
            }
        })
    }

    // pub fn filter_entities(&self, filter: impl Fn((Entity, &T)) -> bool) -> Vec<(Entity, &T)> {
    //     self.components
    //         .iter()
    //         .filter_map(|(entity, component)| {
    //             if filter((*entity, component)) {
    //                 Some((*entity, component))
    //             } else {
    //                 None
    //             }
    //         })
    //         .collect()
    // }

    pub fn clone_component_from(&mut self, other: &mut ComponentStorage<T>, entity: Entity) {
        if let Some(component) = other.get(entity) {
            self.register(entity, component.clone());
        }
    }

    pub fn anonymize(&self, perspective: Entity) -> ComponentStorage<T::Anon> {
        ComponentStorage {
            components: self
                .components
                .iter()
                .map(|(&entity, component)| (entity, component.anonymize(entity, perspective)))
                .collect(),
        }
    }
}
