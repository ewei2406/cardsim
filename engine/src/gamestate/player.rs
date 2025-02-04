use serde::Serialize;

use crate::{
    action::{Actionable, InvalidOutcomeError, Outcome},
    component::{GroupedComponent, Hand},
    connection_manager::ConnectionId,
    entity::Entity,
};

use super::GameState;

#[derive(Serialize, Clone, Debug)]
pub struct PlayerDescription {
    pub nickname: String,
    pub client_id: ConnectionId,
    pub hand: Entity,
}

impl GameState {
    pub fn add_player(&mut self, nickname: String, client_id: ConnectionId) -> Outcome {
        let hand = Hand::add(self, (client_id, nickname.clone()));
        self.players.push(PlayerDescription {
            nickname,
            client_id,
            hand,
        });

        let mut dstate = GameState::new();
        dstate.clone_entity_from(self, hand);
        Outcome::Delta {
            changed: Some(dstate),
            deleted: None,
            players: Some(self.players.clone()),
        }
    }

    pub fn remove_player(&mut self, client_id: ConnectionId) -> Outcome {
        let player = match self.players.iter().position(|x| x.client_id == client_id) {
            Some(player) => player,
            None => {
                log::warn!(
                    "Tried to remove {} but they are not in the game.",
                    client_id
                );
                return Outcome::Invalid(InvalidOutcomeError::InvalidEntityState);
            }
        };

        let hand = self.players[player].hand;
        let hand_component = match self.hands.get(hand) {
            Some(hand) => hand,
            None => {
                log::warn!(
                    "Tried to remove {} but their hand is not in the game.",
                    client_id
                );
                return Outcome::Invalid(InvalidOutcomeError::EntityNotFound);
            }
        };

        // Play all the player's cards
        let cards = hand_component.cards.iter().map(|c| c.id).collect();
        let outcome = self.apply(
            crate::action::Action::PlayHandCards {
                cards,
                x: 0,
                y: 0,
                faceup: true,
            },
            client_id,
        );

        match outcome {
            Outcome::Delta { changed, .. } => {
                if let Some(changed) = changed {
                    self.remove_entity(hand);
                    self.players.remove(player);
                    Outcome::Delta {
                        changed: Some(changed),
                        deleted: Some(vec![hand]),
                        players: Some(self.players.clone()),
                    }
                } else {
                    log::warn!("Failed to remove {} from the game.", client_id);
                    Outcome::Invalid(InvalidOutcomeError::InvalidEntityState)
                }
            }
            _ => {
                log::warn!("Failed to remove {} from the game.", client_id);
                outcome
            }
        }
    }
}
