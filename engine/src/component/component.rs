use std::fmt::Debug;

use serde::Serialize;
use serde_json::to_string;

use crate::entity::Entity;

#[derive(Debug)]
pub struct ComponentStorage<T> {
    pub components: Vec<Option<T>>,
}

impl<T: Clone + Debug + Serialize> ComponentStorage<T> {
    pub fn new() -> Self {
        Self {
            components: Vec::new(),
        }
    }

    pub fn register(&mut self, entity: Entity, component: T) {
        if entity >= self.components.len() {
            self.components.resize(entity + 1, None);
        }
        self.components[entity] = Some(component);
    }

    pub fn get(&self, entity: Entity) -> Option<&T> {
        self.components.get(entity).and_then(|opt| opt.as_ref())
    }

    pub fn get_filter(&self, filter: impl Fn(&T) -> bool) -> Vec<&T> {
        self.components
            .iter()
            .enumerate()
            .filter_map(|(i, opt)| opt.as_ref().filter(|x| filter(x)).map(|x| (i, x)))
            .map(|(_, x)| x)
            .collect()
    }

    pub fn has(&self, filter: impl Fn(Entity, &T) -> bool) -> bool {
        self.components.iter().enumerate().any(|(entity, opt)| {
            opt.as_ref()
                .map(|component| filter(entity, component))
                .unwrap_or(false)
        })
    }

    pub fn get_mut(&mut self, entity: Entity) -> Option<&mut T> {
        self.components.get_mut(entity).and_then(|opt| opt.as_mut())
    }

    pub fn describe(&self) -> String {
        let filtered = self
            .components
            .iter()
            .enumerate()
            .filter_map(|(id, opt)| opt.as_ref().map(|component| (id, component)))
            .collect::<Vec<_>>();
        to_string(&filtered).unwrap()
    }
}
