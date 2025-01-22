use crate::game_objects::game_object::ObjectID;

pub enum Command {
    DeleteEntity { id: ObjectID },
    ExecuteEntity { id: ObjectID, action: String },
    Action { action: String },
}

pub fn parse_command(input: &str) -> Result<Command, String> {
    let mut parts = input.split_whitespace();
    let verb = parts.next().unwrap();
    match verb {
        "delete" => {
            let id = parts.next().unwrap().parse().unwrap();
            Ok(Command::DeleteEntity { id })
        }
        "execute" => {
            let id = parts.next().unwrap().parse().unwrap();
            let action = parts.collect::<Vec<&str>>().join(" ");
            Ok(Command::ExecuteEntity { id, action })
        }
        "action" => {
            let action = parts.collect::<Vec<&str>>().join(" ");
            Ok(Command::Action { action })
        }
        _ => Err("Unknown command".to_string()),
    }
}
