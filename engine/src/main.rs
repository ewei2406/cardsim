use serde_json;
mod action;
mod component;
mod entity;
mod gamestate;
mod util;

fn main() {
    let mut gamestate = gamestate::GameState::new();

    let position = action::util::empty_position(&gamestate);
    let deck = action::deck::create_deck(&mut gamestate, position);

    let serialized_gamestate = serde_json::to_string(&gamestate).unwrap();
    println!("{}", serialized_gamestate);
}
