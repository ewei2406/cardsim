use super::game_object::{GameObject, ObjectID, Position};

#[derive(Debug, Clone)]
pub enum Suit {
    Clubs,
    Diamonds,
    Hearts,
    Spades,
}

#[derive(Debug)]
pub enum Direction {
    Up,
    Down,
}

pub struct Card {
    id: ObjectID,
    rank: u8,
    suit: Suit,
    deck_id: ObjectID,
    position: Position,
    facing: Direction,
}

impl Card {
    pub fn new(id: ObjectID, rank: u8, suit: Suit, deck_id: ObjectID) -> Card {
        Card {
            id,
            deck_id,
            rank,
            suit,
            position: (0, 0),
            facing: Direction::Up,
        }
    }
}

impl GameObject for Card {
    fn id(&self) -> ObjectID {
        self.id
    }

    fn description(&self) -> String {
        serde_json::json!({
            "id": self.id,
            "deck_id": format!("{:?}", self.deck_id),
            "rank": self.rank,
            "suit": format!("{:?}", self.suit),
            "position": self.position,
            "facing": format!("{:?}", self.facing),
        })
        .to_string()
    }

    fn execute(&self, action: &str) -> Result<(), String> {
        Ok(())
    }
}
