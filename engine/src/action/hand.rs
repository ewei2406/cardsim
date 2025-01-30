use std::vec;

use crate::{
    component::*, connection_manager::ConnectionId, entity::Entity, gamestate::GameState,
    util::get_id,
};

use super::{action::InvalidOutcomeError, Outcome};

pub fn add_hand(gamestate: &mut GameState, nickname: String, client_id: ConnectionId) -> Outcome {
    let hand = Hand::add(gamestate, (nickname, client_id));
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
    }
}

fn get_hand(
    hand_storage: &mut ComponentStorage<Hand>,
    client_id: ConnectionId,
) -> Option<(Entity, &mut Hand)> {
    let hand_id = hand_storage.get_entity_match(|hand| hand.client_id == client_id)?;
    let hand = hand_storage.get_mut(hand_id)?;
    Some((hand_id, hand))
}

pub fn play_hand_cards(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    cards: Vec<HandCardId>,
    x: i64,
    y: i64,
    faceup: bool,
) -> Outcome {
    let (hand, hand_component) = match get_hand(&mut gamestate.hands, client_id) {
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
            let position = Position {
                x,
                y,
                z: 0,
                rotation: 0,
            };
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
    }
}

pub fn play_hand_cards_to_deck(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    cards: Vec<HandCardId>,
    deck: Entity,
) -> Outcome {
    let (hand, hand_component) = match get_hand(&mut gamestate.hands, client_id) {
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
    }
}

pub fn show_hand_cards(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    cards: Vec<HandCardId>,
    shown: bool,
) -> Outcome {
    let (hand, hand_component) = match get_hand(&mut gamestate.hands, client_id) {
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
    }
}

pub fn remove_hand(gamestate: &mut GameState, client_id: ConnectionId) -> Outcome {
    // Get the hand entity
    let (hand, hand_component) = match get_hand(&mut gamestate.hands, client_id) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    // Play all cards in the hand
    let cards = hand_component.cards.iter().map(|hc| hc.id).collect();
    let play_outcome = play_hand_cards(gamestate, client_id, cards, 0, 0, true);
    let play_delta = match play_outcome {
        Outcome::Delta { changed, .. } => changed,
        _ => return play_outcome,
    };

    // Remove the hand
    Hand::remove(gamestate, hand);
    Outcome::Delta {
        changed: play_delta,
        deleted: Some(vec![hand]),
    }
}

pub fn draw_card_from_deck(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    deck: Entity,
) -> Outcome {
    // Get the hand
    let (hand, hand_component) = match get_hand(&mut gamestate.hands, client_id) {
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
    }
}

pub fn draw_card_from_table(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    card: Entity,
) -> Outcome {
    // Get the hand
    let (hand, hand_component) = match get_hand(&mut gamestate.hands, client_id) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    // Get the card component
    let card_component = match gamestate.cards.get_mut(card) {
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
    Card::remove(gamestate, card);

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: Some(vec![card]),
    }
}

pub fn draw_cards_from_location(
    gamestate: &mut GameState,
    client_id: ConnectionId,
    x: i64,
    y: i64,
) -> Outcome {
    // Get the hand
    let (hand, hand_component) = match get_hand(&mut gamestate.hands, client_id) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    // Get all cards at the location
    let card_entities: Vec<(Entity, &Card)> =
        gamestate.cards.filter_entities(|(card_entity, _)| {
            match gamestate.positions.get(card_entity) {
                Some(position) => position.x == x && position.y == y,
                None => false,
            }
        });

    // Remove the cards from the table and add them to the hand
    let mut entities_to_remove = Vec::new();
    for (card_entity, card_component) in &card_entities {
        entities_to_remove.push(*card_entity);
        hand_component.cards.push(HandCard {
            id: get_id(),
            suit: card_component.suit.clone(),
            rank: card_component.rank,
            shown: false,
            deck_id: card_component.deck_id,
        })
    }
    for entity in &entities_to_remove {
        Card::remove(gamestate, *entity);
    }

    // Create the delta state
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);

    Outcome::Delta {
        changed: Some(dstate),
        deleted: Some(entities_to_remove),
    }
}
