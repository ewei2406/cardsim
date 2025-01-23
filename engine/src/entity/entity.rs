use std::any::Any;

use super::playing_card::PlayingCard;

pub type EntityId = u64;
pub type EntityPosition = (u64, u64);

pub trait Entity: Any {
    fn id(&self) -> EntityId;
    fn position(&self) -> Option<EntityPosition>;
    fn update_position(&mut self, pos: EntityPosition);
    fn serialize(&self) -> String;
    fn duplicate(&self) -> Box<dyn Entity>;
    fn as_any(&self) -> &dyn Any;
}

pub trait Deserialize {
    fn deserialize(data: String) -> Result<Box<impl Entity>, String>;
}

pub fn deserialize(data: String) -> Result<Box<impl Entity>, String> {
    let parts = data.split_once(',');
    let (entity_type, data) = match parts {
        Some((entity_type, data)) => (entity_type, data),
        None => return Err("Invalid update".to_string()),
    };

    match entity_type {
        PlayingCard::CLASSNAME => PlayingCard::deserialize(data.to_string()),
        _ => Err("Unknown entity type".to_string()),
    }
}

pub fn parse_n(n: &str, label: &str) -> Result<u64, String> {
    n.parse()
        .map_err(|e| format!("Invalid {}: {} ({})", label, n, e))
}
