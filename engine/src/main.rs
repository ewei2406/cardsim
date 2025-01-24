mod action;
mod component;
mod entity;
mod gamestate;

fn main() {
    let mut gamestate = gamestate::GameState::new();
    println!("{}", gamestate.describe());

    let position = action::util::empty_position(&gamestate);
    let deck = action::deck::create_deck(&mut gamestate, position);

    println!("{}", gamestate.describe());
}
