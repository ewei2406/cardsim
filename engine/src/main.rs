use std::io::{self, Write};

mod entity;
mod game_controller;
mod game_table;

fn main() {
    let mut table = game_table::GameTable::new();

    loop {
        print!("# ");
        io::stdout().flush().unwrap();

        let mut command = String::new();
        io::stdin().read_line(&mut command).unwrap();

        let command = game_controller::parse(command.trim());
        match command {
            Ok(command) => {
                let updates = game_controller::translate_command(command, &table);
                match updates {
                    Ok(updates) => {
                        for update in updates {
                            println!("[update]: {}", update.serialize());
                            table.apply_update(update);
                        }
                    }
                    Err(e) => println!("[update error]: {}", e),
                }
            }
            Err(e) => println!("[error]: {}", e),
        }

        println!("[table state]: {}", table.serialize());
    }
}
