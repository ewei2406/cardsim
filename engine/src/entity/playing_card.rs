use super::entity::{parse_n, Deserialize, Entity, EntityId, EntityPosition};

#[derive(Debug, Clone)]
pub enum Suit {
    Hearts,
    Diamonds,
    Clubs,
    Spades,
}

pub type Rank = u8;

#[derive(Clone)]
pub struct PlayingCard {
    pub id: EntityId,
    pub position: EntityPosition,
    pub suit: Suit,
    pub rank: Rank,
    pub deck_id: EntityId,
    pub hand_id: EntityId,
    pub facing_up: u8,
}

impl PlayingCard {
    pub const CLASSNAME: &'static str = "playingcard";

    pub fn new(
        id: EntityId,
        position: EntityPosition,
        suit: Suit,
        rank: Rank,
        deck_id: EntityId,
        hand_id: EntityId,
        facing_up: u8,
    ) -> Self {
        PlayingCard {
            id,
            position,
            suit,
            rank,
            deck_id,
            hand_id,
            facing_up,
        }
    }
}

impl Entity for PlayingCard {
    fn position(&self) -> Option<EntityPosition> {
        Some(self.position)
    }

    fn id(&self) -> EntityId {
        self.id
    }

    fn serialize(&self) -> String {
        format!(
            "{},{},{},{},{:?},{},{},{},{}",
            PlayingCard::CLASSNAME,
            self.id,
            self.position.0,
            self.position.1,
            self.suit,
            self.rank,
            self.deck_id,
            self.hand_id,
            self.facing_up,
        )
    }

    fn update_position(&mut self, pos: EntityPosition) {
        self.position = pos;
    }

    fn duplicate(&self) -> Box<dyn Entity> {
        Box::new(self.clone())
    }

    fn as_any(&self) -> &dyn std::any::Any {
        self
    }
}

impl Deserialize for PlayingCard {
    fn deserialize(data: String) -> Result<Box<impl Entity>, String> {
        let p = data.split(',').collect::<Vec<&str>>();
        if p.len() != 8 {
            println!("Length of parts: {}", p.len());
            println!("parts[0]: {}", p[0]);
            return Err("Invalid PlayingCard data size".to_string());
        }

        let card = PlayingCard {
            id: parse_n(p[0], "id")?,
            position: (parse_n(p[1], "position x")?, parse_n(p[2], "position y")?),
            suit: match p[3] {
                "Hearts" => Suit::Hearts,
                "Diamonds" => Suit::Diamonds,
                "Clubs" => Suit::Clubs,
                "Spades" => Suit::Spades,
                _ => return Err("Invalid suit".to_string()),
            },
            rank: parse_n(p[4], "rank")? as Rank,
            deck_id: parse_n(p[5], "deck_id")?,
            hand_id: parse_n(p[6], "hand_id")?,
            facing_up: parse_n(p[7], "facing_up")? as u8,
        };
        Ok(Box::new(card))
    }
}
