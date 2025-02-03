use std::vec;

use crate::{
    component::*, connection_manager::ConnectionId, entity::Entity, gamestate::GameState,
    util::get_id,
};

use super::{action::InvalidOutcomeError, Outcome};

pub fn play_hand_cards(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    cards: Vec<HandCardId>,
    x: i64,
    y: i64,
    faceup: bool,
) -> Outcome {
    let hand = match gamestate.players.iter().find(|x| x.client_id == client_id) {
        Some(x) => x.hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let cards_set: std::collections::HashSet<HandCardId> = cards.iter().cloned().collect();

    let mut remaining = Vec::new();
    let mut played = Vec::new();
    hand_component
        .cards
        .iter()
        .for_each(|hand_card| match cards_set.contains(&hand_card.id) {
            true => played.push(hand_card.clone()),
            false => remaining.push(hand_card.clone()),
        });

    hand_component.cards = remaining;
    let new_cards: Vec<Entity> = played
        .iter()
        .map(|played_card| {
            let card = Card {
                suit: played_card.suit.clone(),
                rank: played_card.rank,
                deck_id: played_card.deck_id,
                faceup,
            };
            let position = gamestate.nearest_empty_position(x, y);
            Card::add(gamestate, (card, position))
        })
        .collect();

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    for entity in new_cards {
        dstate.clone_entity_from(gamestate, entity);
    }
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
    }
}

pub fn play_hand_cards_to_deck(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    cards: Vec<HandCardId>,
    deck: Entity,
) -> Outcome {
    let hand = match gamestate.players.iter().find(|x| x.client_id == client_id) {
        Some(x) => x.hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };
    let cards_set: std::collections::HashSet<HandCardId> = cards.iter().cloned().collect();

    let mut remaining = Vec::new();
    let mut played = Vec::new();
    hand_component
        .cards
        .iter()
        .for_each(|hand_card| match cards_set.contains(&hand_card.id) {
            true => played.push(hand_card.clone()),
            false => remaining.push(hand_card.clone()),
        });

    hand_component.cards = remaining;
    for played_card in played {
        deck_component.return_card(CardInit(played_card.suit, played_card.rank));
    }

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    dstate.clone_entity_from(gamestate, deck);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
    }
}

pub fn show_hand_cards(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    cards: Vec<HandCardId>,
    shown: bool,
) -> Outcome {
    let hand = match gamestate.players.iter().find(|x| x.client_id == client_id) {
        Some(x) => x.hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let cards_set: std::collections::HashSet<HandCardId> = cards.iter().cloned().collect();
    for hand_card in &mut hand_component.cards {
        if cards_set.contains(&hand_card.id) {
            hand_card.shown = shown;
        }
    }

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
    }
}

pub fn draw_card_from_deck(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    deck: Entity,
) -> Outcome {
    // Get the hand
    let hand = match gamestate.players.iter().find(|x| x.client_id == client_id) {
        Some(x) => x.hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    // Get the deck component
    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    // Draw a card from the deck
    let card_init = match deck_component.draw_card() {
        Some(card) => card,
        None => {
            Deck::remove(gamestate, deck);
            return Outcome::Invalid(InvalidOutcomeError::InvalidEntityState);
        }
    };

    // Add the card to the hand
    hand_component.cards.push(HandCard {
        id: get_id(),
        suit: card_init.0,
        rank: card_init.1,
        shown: false,
        deck_id: deck_component.deck_id,
    });

    // If deck is empty, remove it
    let removed = match deck_component.card_inits.is_empty() {
        true => {
            Deck::remove(gamestate, deck);
            Some(vec![deck])
        }
        false => None,
    };

    // Create the delta state
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    dstate.clone_entity_from(gamestate, deck);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: removed,
        players: None,
    }
}

pub fn draw_cards_from_table(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    cards: Vec<Entity>,
) -> Outcome {
    // Get the hand
    let hand = match gamestate.players.iter().find(|x| x.client_id == client_id) {
        Some(x) => x.hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    // Add the cards to the hand
    for card in &cards {
        let card_component = match gamestate.cards.get(*card) {
            Some(card) => card,
            None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
        };
        hand_component.cards.push(HandCard {
            id: get_id(),
            suit: card_component.suit.clone(),
            rank: card_component.rank,
            shown: false,
            deck_id: card_component.deck_id,
        });
    }

    for card in &cards {
        Card::remove(gamestate, *card);
    }

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: Some(cards),
        players: None,
    }
}

pub fn flip_cards(gamestate: &mut GameState, cards: Vec<Entity>, faceup: bool) -> Outcome {
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
