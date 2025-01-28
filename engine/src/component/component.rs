use std::{collections::HashMap, fmt::Debug};

use serde::Serialize;

use crate::entity::Entity;

#[derive(Serialize, Debug)]
pub struct ComponentStorage<T> {
    components: HashMap<Entity, T>,
}

pub trait Anonymize {
    type Anon;
    fn anonymize(&self, as_entity: Entity, perspective: Entity) -> Self::Anon;
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

    pub fn get(&self, entity: Entity) -> Option<&T> {
        self.components.get(&entity)
    }

    pub fn get_filter(&self, filter: impl Fn(&T) -> bool) -> Vec<&T> {
        self.components
            .values()
            .filter(|component| filter(component))
            .collect()
    }

    pub fn has(&self, filter: impl Fn(Entity, &T) -> bool) -> bool {
        self.components
            .iter()
            .any(|(entity, component)| filter(*entity, component))
    }

    pub fn get_mut(&mut self, entity: Entity) -> Option<&mut T> {
        self.components.get_mut(&entity)
    }

    pub fn clone_component_from(&mut self, other: &mut ComponentStorage<T>, entity: Entity) {
        if let Some(component) = other.get(entity) {
            self.register(entity, component.clone());
        }
    }

    pub fn anonymize(&self, perspective: Entity) -> Vec<T::Anon> {
        self.components
            .iter()
            .map(|(entity, component)| component.anonymize(*entity, perspective))
            .collect()
    }
}
