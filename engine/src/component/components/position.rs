use serde::{Deserialize, Serialize};

use crate::{component::component::Anonymize, entity::Entity};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Position {
    pub x: i64,
    pub y: i64,
}

impl Anonymize for Position {
    type Anon = Position;
    fn anonymize(&self, _as_entity: Entity, _perspective: Entity) -> Self::Anon {
        self.clone()
    }
}
