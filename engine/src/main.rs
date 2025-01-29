use std::sync::Arc;

use action::Action;
use connection_manager::ConnectionManager;
use futures_util::StreamExt;
use game_controller::GameController;
use tokio::net::TcpListener;
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
    let connection_manager = std::sync::Arc::new(ConnectionManager::new());
    let game_controller = std::sync::Arc::new(GameController::new(Arc::clone(&connection_manager)));
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    println!("Listening on ws://127.0.0.1:8080");

    let gc = Arc::clone(&game_controller);
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
        loop {
            interval.tick().await;
            gc.cleanup_stale_games().await;
        }
    });

    while let Ok((stream, _)) = listener.accept().await {
        // Spawn a new thread to handle the connection
        let cm = Arc::clone(&connection_manager);
        let gc = Arc::clone(&game_controller);
        tokio::spawn(async move {
            match cm.handle_connection(stream).await {
                Ok((client_id, mut rx)) => {
                    println!("Client {} connected", client_id);

                    // Handle messages from the client
                    while let Some(message) = rx.next().await {
                        match message {
                            Ok(message) => {
                                println!("Received message: {:?}", message);
                                gc.handle_message(client_id, message).await;
                            }
                            Err(e) => {
                                eprintln!("Error receiving message: {:?}", e);
                                break;
                            }
                        }
                    }

                    println!("Client {} disconnected", client_id);
                }
                Err(e) => eprintln!("Error handling connection: {:?}", e),
            }
        });
    }
    Ok(())
}
