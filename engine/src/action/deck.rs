use crate::{
    component::{Card, Deck, Position},
    entity::Entity,
    gamestate::GameState,
    util::get_id,
};

use super::action::Outcome;

pub fn create_deck(gamestate: &mut GameState, x: i64, y: i64) -> Outcome {
    let position = Position {
        x,
        y,
        z: 0,
        rotation: 0,
    };
    let deck = Deck::new(get_id());
    let entity = Deck::add_deck(gamestate, deck, position);
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, entity);
    Outcome::Delta {
        changed: dstate,
        deleted: vec![],
    }
}

// Move the top n cards of a deck onto another spot
pub fn cut_deck(gamestate: &mut GameState, deck: Entity, n: usize, x1: i64, y1: i64) -> Outcome {
    if n == 0 {
        return Outcome::None;
    }

    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::None,
    };
    let mut flipped = Vec::new();
    for _ in 0..n {
        match deck_component.draw_card() {
            Some(card) => flipped.push(card),
            None => break,
        }
    }

    if flipped.is_empty() {
        return Outcome::None;
    }

    let orig_id = deck_component.deck_id;
    let new_deck = Deck {
        deck_id: orig_id,
        card_inits: flipped,
    };

    let position = Position {
        x: x1,
        y: y1,
        z: 0,
        rotation: 0,
    };
    Deck::add_deck(gamestate, new_deck, position);
    Outcome::None
}

pub fn flip_cards_from_deck(
    gamestate: &mut GameState,
    deck: Entity,
    n: usize,
    x1: i64,
    y1: i64,
) -> Outcome {
    if n == 0 {
        return Outcome::None;
    }

    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::None,
    };
    let mut flipped = Vec::new();
    for _ in 0..n {
        match deck_component.draw_card() {
            Some(card) => flipped.push(card),
            None => break,
        }
    }

    let cards: Vec<Card> = flipped
        .iter()
        .map(|card_init| Card {
            rank: card_init.1,
            suit: card_init.0.clone(),
            faceup: true,
            deck_id: deck_component.deck_id,
        })
        .collect();

    let position = Position {
        x: x1,
        y: y1,
        z: 0,
        rotation: 0,
    };

    let card_entities: Vec<Entity> = cards
        .into_iter()
        .map(|card| Card::add_card(gamestate, card, position.clone()))
        .collect();

    // Some(card_entities)
    Outcome::None
}

pub fn shuffle_deck(gamestate: &mut GameState, deck: Entity) -> Outcome {
    if let Some(deck_component) = gamestate.decks.get_mut(deck) {
        deck_component.shuffle();
    }
    Outcome::None
}
