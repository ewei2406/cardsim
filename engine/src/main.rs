use action::{Action, Actionable, Outcome};
use serde_json;
mod action;
mod component;
mod entity;
mod gamestate;
mod util;

fn main() {
    let mut gamestate = gamestate::GameState::new();

    let create_deck_action = Action::CreateStandardDecks {
        x: 0,
        y: 0,
        n: 1,
        jokers: false,
    };
    gamestate.apply(create_deck_action.clone());

    let serialized_action = serde_json::to_string(&create_deck_action).unwrap();
    println!("{}", serialized_action);

    loop {
        let serialized_gamestate = serde_json::to_string(&gamestate).unwrap();
        println!("\nGAMESTATE: \n{}", serialized_gamestate);

        let anon_gamestate = gamestate.anonymize(0);
        let serialized_anon_gamestate = serde_json::to_string(&anon_gamestate).unwrap();
        println!("\nANON GAMESTATE: \n{}\n", serialized_anon_gamestate);

        println!("Input action:");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        if input.eq("show\n") {
            continue;
        }

        let action: Action = serde_json::from_str(&input).unwrap();

        let outcome = gamestate.apply(action);
        let serialized_outcome = serde_json::to_string(&outcome).unwrap();
        println!("\nOUTCOME: \n{}", serialized_outcome);

        match outcome {
            Outcome::Delta { changed, deleted } => {
                match changed {
                    Some(changes) => println!(
                        "\nChanges: \n{}",
                        serde_json::to_string(&changes.anonymize(0)).unwrap()
                    ),
                    None => {}
                }
                match deleted {
                    Some(deleted) => {
                        println!("\nDeleted: \n{}", serde_json::to_string(&deleted).unwrap())
                    }
                    None => {}
                }
            }
            Outcome::None => {
                println!("Outcome: None");
            }
            Outcome::Invalid(error) => {
                println!("Outcome: {:?}", error);
            }
        }
    }
}
