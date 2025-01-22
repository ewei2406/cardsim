use crate::{
    game_objects::card::{Card, Suit},
    table::table::Table,
};

pub enum Action {
    CreateDeck,
}

pub fn parse_action(input: &str) -> Result<Action, String> {
    match input {
        "create_deck" => Ok(Action::CreateDeck),
        _ => Err("Unknown action".to_string()),
    }
}

pub trait TableActions {
    fn create_deck(&mut self) -> Result<(), String>;
}

impl TableActions for Table {
    fn create_deck(&mut self) -> Result<(), String> {
        let deck_id = self.get_id();
        let suits = vec![Suit::Clubs, Suit::Diamonds, Suit::Hearts, Suit::Spades];
        for suit in suits {
            for rank in 1..14 {
                let id = self.get_id();
                let suit = suit.clone();
                self.add_entity(Box::new(Card::new(id, rank, suit, deck_id)))?
            }
        }
        Ok(())
    }
}
