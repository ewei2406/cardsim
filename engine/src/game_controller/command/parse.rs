use crate::entity::{parse_n, EntityId};
use crate::game_controller::command::game_command::GameCommand;

pub fn parse(command: &str) -> Result<GameCommand, String> {
    let p: Vec<&str> = command.split_whitespace().collect();
    if p.is_empty() {
        return Err("Empty command".to_string());
    }
    let command = p[0];
    match command {
        "move_entity" => {
            if p.len() != 4 {
                return Err("Wrong number of arguments".to_string());
            }
            let id: EntityId = parse_n(p[1], "id")?;
            let x: u64 = parse_n(p[2], "x")?;
            let y: u64 = parse_n(p[3], "y")?;
            Ok(GameCommand::MoveEntity { id, pos: (x, y) })
        }
        "delete_entity" => {
            if p.len() != 2 {
                return Err("Wrong number of arguments".to_string());
            }
            let id: EntityId = parse_n(p[1], "id")?;
            Ok(GameCommand::DeleteEntity { id })
        }
        "move_stack" => {
            if p.len() != 6 {
                return Err("Wrong number of arguments".to_string());
            }
            let depth: u64 = parse_n(p[1], "depth")?;
            let x1: u64 = parse_n(p[2], "x1")?;
            let y1: u64 = parse_n(p[3], "y1")?;
            let x2: u64 = parse_n(p[4], "x2")?;
            let y2: u64 = parse_n(p[5], "y2")?;
            Ok(GameCommand::MoveStack {
                depth,
                pos: (x1, y1),
                target_pos: (x2, y2),
            })
        }
        "delete_stack" => {
            if p.len() != 4 {
                return Err("Wrong number of arguments".to_string());
            }
            let depth: u64 = parse_n(p[1], "depth")?;
            let x: u64 = parse_n(p[2], "x")?;
            let y: u64 = parse_n(p[3], "y")?;
            Ok(GameCommand::DeleteStack { depth, pos: (x, y) })
        }
        "create_cards_stack" => {
            if p.len() != 3 {
                return Err("Wrong number of arguments".to_string());
            }
            let x: u64 = parse_n(p[1], "x")?;
            let y: u64 = parse_n(p[2], "y")?;
            Ok(GameCommand::CreateCardsStack { pos: (x, y) })
        }
        "flip_cards_stack_up" => {
            if p.len() != 4 {
                return Err("Wrong number of arguments".to_string());
            }
            let depth: u64 = parse_n(p[1], "depth")?;
            let x: u64 = parse_n(p[2], "x")?;
            let y: u64 = parse_n(p[3], "y")?;
            Ok(GameCommand::FlipCardsStackUp { depth, pos: (x, y) })
        }
        "flip_cards_stack_down" => {
            if p.len() != 4 {
                return Err("Wrong number of arguments".to_string());
            }
            let depth: u64 = parse_n(p[1], "depth")?;
            let x: u64 = parse_n(p[2], "x")?;
            let y: u64 = parse_n(p[3], "y")?;
            Ok(GameCommand::FlipCardsStackDown { depth, pos: (x, y) })
        }
        "gather_cards_stack" => {
            if p.len() != 4 {
                return Err("Wrong number of arguments".to_string());
            }
            let x: u64 = parse_n(p[1], "x")?;
            let y: u64 = parse_n(p[2], "y")?;
            let deck_id: EntityId = parse_n(p[3], "deck_id")?;
            Ok(GameCommand::GatherCardsStack {
                pos: (x, y),
                deck_id,
            })
        }
        _ => Err("Unknown command".to_string()),
    }
}
