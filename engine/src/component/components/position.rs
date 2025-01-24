use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Position {
    pub x: i64,
    pub y: i64,
    pub z: i64,
    pub rotation: i64,
}
