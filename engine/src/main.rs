use std::sync::Arc;

use action::Action;
use connection_manager::ConnectionManager;
use constants::CLEANUP_STALE_INTERVAL_SECONDS;
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
    env_logger::init();

    let connection_manager = std::sync::Arc::new(ConnectionManager::new());
    let game_controller = std::sync::Arc::new(GameController::new(Arc::clone(&connection_manager)));

    let port = std::env::var("PORT").unwrap_or_else(|_| {
        log::warn!("PORT environment variable is not set, using default of 8080.");
        "8080".to_string()
    });
    let host = std::env::var("HOST").unwrap_or_else(|_| {
        log::warn!("HOST environment variable is not set, using default of 127.0.0.1.");
        "127.0.0.1".to_string()
    });
    let listener = TcpListener::bind(format!("{}:{}", host, port)).await?;
    log::info!("Listening on {}", format!("{}:{}", host, port));

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
