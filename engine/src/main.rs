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
    gamestate.apply(create_deck_action.clone());

    let serialized_action = serde_json::to_string(&create_deck_action).unwrap();
    println!("{}", serialized_action);

    loop {
        println!("Action:");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        let action: Action = serde_json::from_str(&input).unwrap();

        let outcome = gamestate.apply(action);
        let outcome = serde_json::to_string(&outcome).unwrap();
        println!("{}", outcome);

        let serialized_gamestate = serde_json::to_string(&gamestate).unwrap();
        println!("{}", serialized_gamestate);
    }
}
