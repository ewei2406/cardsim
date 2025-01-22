use std::io::{self, Write};

use command::command::parse_command;

mod command;
mod game_objects;
mod table;

fn main() {
    let mut table = table::table::Table::new(0);

    loop {
        print!("Enter command: ");
        io::stdout().flush().unwrap();

        let mut command = String::new();
        io::stdin().read_line(&mut command).unwrap();
        let command = command.trim();

        if command == "exit" {
            break;
        }

        let command = parse_command(command);

        let result = match command {
            Ok(command) => table.apply_command(command),
            Err(e) => Err(e),
        };

        if let Err(e) = result {
            println!("Error: {}", e);
        } else {
            println!("{}", table.describe());
        }
    }
}
