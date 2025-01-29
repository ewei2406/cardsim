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
    let game_controller = std::sync::Arc::new(GameController::new(&connection_manager));
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    println!("Listening on ws://127.0.0.1:8080");

    while let Ok((stream, _)) = listener.accept().await {
        // Spawn a new thread to handle the connection
        let connection_manager = connection_manager.clone();
        tokio::spawn(async move {
            match connection_manager.handle_connection(stream).await {
                Ok((client_id, rx)) => {
                    println!("Client {} connected", client_id);

                    // Handle messages from the client
                    while let Some(message) = rx.next().await {
                        match message {
                            Ok(message) => {
                                let action: Action = serde_json::from_str(&message).unwrap();
                                println!("Received action: {:?}", action);
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
