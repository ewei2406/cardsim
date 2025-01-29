use std::vec;

use crate::{component::*, entity::Entity, gamestate::GameState, util::get_id};

use super::{action::InvalidOutcomeError, Outcome};

pub fn add_hand(gamestate: &mut GameState, nickname: String) -> Outcome {
    let hand = Hand::add(gamestate, nickname);
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
    }
}

pub fn play_hand_cards(
    gamestate: &mut GameState,
    hand: Entity,
    cards: Vec<HandCardId>,
    x: i64,
    y: i64,
    faceup: bool,
) -> Outcome {
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
    hand: Entity,
    cards: Vec<HandCardId>,
    deck: Entity,
) -> Outcome {
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
    }
}

pub fn show_hand_cards(
    gamestate: &mut GameState,
    hand: Entity,
    cards: Vec<HandCardId>,
    shown: bool,
) -> Outcome {
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
    }
}

pub fn remove_hand(gamestate: &mut GameState, hand: Entity) -> Outcome {
    let hand_component = match gamestate.hands.get(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let play_outcome = play_hand_cards(
        gamestate,
        hand,
        hand_component.cards.iter().map(|hc| hc.id).collect(),
        0,
        0,
        true,
    );
    let play_delta = match play_outcome {
        Outcome::Delta { changed, .. } => changed,
        _ => return play_outcome,
    };

    Hand::remove(gamestate, hand);
    Outcome::Delta {
        changed: play_delta,
        deleted: Some(vec![hand]),
    }
}

pub fn draw_card_from_deck(gamestate: &mut GameState, hand: Entity, deck: Entity) -> Outcome {
    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };
    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };
    let card_init = match deck_component.draw_card() {
        Some(card) => card,
        None => {
            Deck::remove(gamestate, deck);
            return Outcome::Invalid(InvalidOutcomeError::InvalidEntityState);
        }
    };

    hand_component.cards.push(HandCard {
        id: get_id(),
        suit: card_init.0,
        rank: card_init.1,
        shown: false,
        deck_id: deck_component.deck_id,
    });
    let removed = match deck_component.card_inits.is_empty() {
        true => {
            Deck::remove(gamestate, deck);
            Some(vec![deck])
        }
        false => None,
    };

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);
    dstate.clone_entity_from(gamestate, deck);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: removed,
    }
}

pub fn draw_card_from_table(gamestate: &mut GameState, hand: Entity, card: Entity) -> Outcome {
    let card_component = match gamestate.cards.get_mut(card) {
        Some(card) => card,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };
    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
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
    hand: Entity,
    x: i64,
    y: i64,
) -> Outcome {
    let hand_component = match gamestate.hands.get_mut(hand) {
        Some(hand) => hand,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let card_entities: Vec<(usize, &Card)> = gamestate
        .entities
        .iter()
        .filter_map(|&entity| {
            if let Some(card) = gamestate.cards.get(entity) {
                if let Some(pos) = gamestate.positions.get(entity) {
                    if pos.x == x && pos.y == y {
                        return Some((entity, card));
                    }
                }
            }
            None
        })
        .collect();

    for (_, card_component) in &card_entities {
        hand_component.cards.push(HandCard {
            id: get_id(),
            suit: card_component.suit.clone(),
            rank: card_component.rank,
            shown: false,
            deck_id: card_component.deck_id,
        })
    }

    let entities_to_remove: Vec<Entity> = card_entities.iter().map(|c| c.0).collect();
    for entity in &entities_to_remove {
        Card::remove(gamestate, *entity);
    }

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, hand);

    Outcome::Delta {
        changed: Some(dstate),
        deleted: Some(entities_to_remove),
    }
}
