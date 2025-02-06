use std::io::Write;
use std::sync::Arc;

use action::Action;
use connection_manager::ConnectionManager;
use constants::CLEANUP_STALE_INTERVAL_SECONDS;
use futures_util::StreamExt;
use game_controller::{GameController, ServerResponse};
use tokio::io::{self, AsyncBufReadExt};
use tokio::net::TcpListener;
use util::get_id;
mod action;
mod component;
mod connection_manager;
mod constants;
mod entity;
mod game_controller;
mod gamestate;
mod util;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    let connection_manager = std::sync::Arc::new(ConnectionManager::new());
    let game_controller = std::sync::Arc::new(GameController::new(Arc::clone(&connection_manager)));
    let port = std::env::var("ENGINE_PORT").unwrap_or_else(|_| {
        panic!("ENGINE_PORT environment variable is not set");
    });
    let listener = TcpListener::bind(format!("127.0.0.1:{}", port)).await?;
    log::info!("Listening on {}", format!("127.0.0.1:{}", port));

    let gc = Arc::clone(&game_controller);
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(
            CLEANUP_STALE_INTERVAL_SECONDS,
        ));
        loop {
            interval.tick().await;
            gc.cleanup_stale_games().await;
        }
    });

    let gc = Arc::clone(&game_controller);
    use_cli(gc);

    while let Ok((stream, _)) = listener.accept().await {
        let cm = Arc::clone(&connection_manager);
        let gc = Arc::clone(&game_controller);
        handle_stream(stream, cm, gc);
    }
    Ok(())
}

fn handle_stream(
    stream: tokio::net::TcpStream,
    cm: Arc<ConnectionManager>,
    gc: Arc<GameController>,
) {
    // Handle the stream
    tokio::spawn(async move {
        match cm.handle_connection(stream).await {
            Ok((client_id, mut rx)) => {
                log::info!("Client {} connected.", client_id);
                // Handle messages from the client
                while let Some(message) = rx.next().await {
                    match message {
                        Ok(message) => {
                            log::debug!("Received message: {:?}", message);
                            gc.handle_message(client_id, message).await;
                        }
                        Err(e) => {
                            log::error!("Error receiving message: {:?}", e);
                            break;
                        }
                    }
                }
                gc.leave_game(client_id).await;
                log::info!("Client {} disconnected.", client_id);
            }
            Err(_) => {
                log::info!("Client ID setup failed.");
            }
        }
    });
}

fn use_cli(gc: Arc<GameController>) {
    tokio::spawn(async move {
        let stdin = io::stdin();
        let mut reader = io::BufReader::new(stdin).lines();
        print!("> ");
        std::io::stdout().flush().unwrap();
        while let Some(line) = reader.next_line().await.unwrap_or(None) {
            match line.as_str() {
                "list" => {
                    let games = gc.list_games().await;
                    println!("Found {} games: ", games.len());
                    for game_desc in games {
                        println!("- {:?}", game_desc);
                    }
                }
                "message" => {
                    print!("Enter game ID to message: ");
                    std::io::stdout().flush().unwrap();
                    if let Some(game_id) = reader.next_line().await.unwrap_or(None) {
                        match game_id.parse::<usize>() {
                            Ok(game_id) => {
                                print!("Enter message: ");
                                std::io::stdout().flush().unwrap();
                                if let Some(message) = reader.next_line().await.unwrap_or(None) {
                                    gc.send_to_game_clients(
                                        game_id,
                                        &ServerResponse::ChatMessage {
                                            client_id: 0,
                                            message,
                                        },
                                    )
                                    .await;
                                    println!("Message sent to game {}.", game_id);
                                } else {
                                    println!("Failed to read message.");
                                }
                            }
                            Err(_) => {
                                println!("Invalid game ID.")
                            }
                        };
                    } else {
                        println!("Failed to read game ID.");
                    }
                }
                "get" => {
                    print!("Enter game ID to get: ");
                    std::io::stdout().flush().unwrap();
                    if let Some(game_id) = reader.next_line().await.unwrap_or(None) {
                        match game_id.parse::<usize>() {
                            Ok(game_id) => {
                                let game = gc.get_game(game_id).await;
                                match game {
                                    Some(game) => {
                                        println!("Game {} found: {:?}", game_id, game.lock().await);
                                    }
                                    None => {
                                        println!("Game {} not found.", game_id);
                                    }
                                }
                            }
                            Err(_) => {
                                println!("Invalid game ID.")
                            }
                        };
                    } else {
                        println!("Failed to read game ID.");
                    }
                }
                "create" => {
                    println!("Creating game...");
                    match gc.create_game(get_id(), "SYSTEM".into()).await {
                        Ok(game_id) => {
                            println!("Game {} created.", game_id)
                        }
                        Err(err) => {
                            println!("Failed to create game: {}", err)
                        }
                    };
                }
                "delete" => {
                    print!("Enter game ID to delete: ");
                    std::io::stdout().flush().unwrap();
                    if let Some(game_id) = reader.next_line().await.unwrap_or(None) {
                        match game_id.parse::<usize>() {
                            Ok(game_id) => {
                                println!("Deleting game {}...", game_id);
                                gc.delete_game(game_id).await;
                                println!("Game {} deleted.", game_id)
                            }
                            Err(_) => {
                                println!("Invalid game ID.")
                            }
                        };
                    } else {
                        println!("Failed to read game ID.");
                    }
                }
                "exit" => {
                    println!("Exiting...");
                    std::process::exit(0);
                }
                _ => {
                    println!("Unknown command: {}", line);
                }
            }
            print!("> ");
            std::io::stdout().flush().unwrap();
        }
    });
}
