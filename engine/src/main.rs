use action::{Action, Actionable};
use serde_json;
mod action;
mod component;
mod entity;
mod gamestate;
mod util;

fn main() {
    let mut gamestate = gamestate::GameState::new();

    let create_deck_action = Action::CreateDeck { x: 0, y: 0 };
    create_deck_action.apply(&mut gamestate);

    let serialized_action = serde_json::to_string(&create_deck_action).unwrap();
    println!("{}", serialized_action);

    // let serialized_gamestate = serde_json::to_string(&gamestate).unwrap();
    // println!("{}", serialized_gamestate);
}
