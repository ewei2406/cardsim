use crate::{entity::Entity, gamestate::GameState};

use super::{InvalidOutcomeError, Outcome};

pub fn flip_cards(gamestate: &mut GameState, cards: Vec<Entity>) -> Outcome {
    if cards.is_empty() {
        return Outcome::None;
    }
    let faceup = match gamestate.cards.get(cards[0]) {
        Some(card) => !card.faceup,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };
    for card in &cards {
        let card_component = match gamestate.cards.get_mut(*card) {
            Some(card) => card,
            None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
        };
        card_component.faceup = faceup;
    }

    let mut dstate = GameState::new();
    for entity in &cards {
        dstate.clone_entity_from(gamestate, *entity);
    }
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
    }
}
