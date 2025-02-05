use super::action::Outcome;
use super::InvalidOutcomeError;
use crate::component::{CardInit, DeckId, GroupedComponent, Hand, HandCard, Suit};
use crate::util::{self, NearestEmptyPosition};
use crate::{
    component::{Card, Deck},
    entity::Entity,
    gamestate::GameState,
};

pub fn create_standard_decks(
    gamestate: &mut GameState,
    x: i64,
    y: i64,
    n: usize,
    jokers: bool,
) -> Outcome {
    let mut card_inits = Vec::new();
    let suits = vec![Suit::H, Suit::D, Suit::C, Suit::S];
    let ranks = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    for _ in 0..n {
        for suit in suits.iter() {
            for rank in ranks.iter() {
                card_inits.push(CardInit(suit.clone(), *rank, util::get_id()));
            }
        }
        if jokers {
            card_inits.push(CardInit(Suit::J, 14, util::get_id()));
            card_inits.push(CardInit(Suit::J, 15, util::get_id()));
        }
    }
    create_deck(gamestate, x, y, card_inits)
}

pub fn create_deck(
    gamestate: &mut GameState,
    x: i64,
    y: i64,
    card_inits: Vec<CardInit>,
) -> Outcome {
    let position = NearestEmptyPosition::bfs(gamestate, x, y);
    let deck = Deck::new(gamestate.get_entity(), card_inits);
    let entity = Deck::add(gamestate, (deck, position));
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, entity);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
    }
}

// Move the top n cards of a deck onto another spot
pub fn cut_deck(gamestate: &mut GameState, deck: Entity, n: usize) -> Outcome {
    let position = match gamestate.positions.get(deck) {
        Some(position) => NearestEmptyPosition::bfs(gamestate, position.x, position.y),
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };
    if n == 0 {
        return Outcome::None;
    }
    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };
    let mut flipped = Vec::new();
    for _ in 0..n {
        match deck_component.draw_card() {
            Some(card) => flipped.push(card),
            None => break,
        }
    }

    let orig_id = deck_component.deck_id;
    let new_deck = Deck::new(orig_id, flipped);

    let mut deleted = None;
    if deck_component.card_inits.is_empty() {
        Deck::remove(gamestate, deck);
        deleted = Some(vec![deck]);
    }

    let new_deck_entity = Deck::add(gamestate, (new_deck, position));
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, new_deck_entity);
    dstate.clone_entity_from(gamestate, deck);

    Outcome::Delta {
        changed: Some(dstate),
        deleted,
        players: None,
    }
}

pub fn flip_card_from_deck(gamestate: &mut GameState, deck: Entity, faceup: bool) -> Outcome {
    let position = match gamestate.positions.get(deck) {
        Some(position) => match faceup {
            true => NearestEmptyPosition::pos_x_wrap(gamestate, position.x + 2, position.y, 8),
            false => NearestEmptyPosition::neg_x_wrap(gamestate, position.x - 2, position.y, 8),
        },
        None => return Outcome::None,
    };
    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::None,
    };
    let flipped = match deck_component.draw_card() {
        Some(card) => card,
        None => {
            // Remove the deck if it's empty
            Deck::remove(gamestate, deck);
            return Outcome::Delta {
                changed: None,
                deleted: Some(vec![deck]),
                players: None,
            };
        }
    };

    let card = Card {
        rank: flipped.1,
        suit: flipped.0.clone(),
        faceup,
        deck_id: deck_component.deck_id,
    };
    let is_empty = deck_component.card_inits.is_empty();

    Card::add_id(gamestate, (card, position.clone()), flipped.2);
    let mut dstate = GameState::new();
    if is_empty {
        Deck::remove(gamestate, deck);
    } else {
        dstate.clone_entity_from(gamestate, deck);
    }
    dstate.clone_entity_from(gamestate, flipped.2);

    Outcome::Delta {
        changed: Some(dstate),
        deleted: if is_empty { Some(vec![deck]) } else { None },
        players: None,
    }
}

pub fn shuffle_deck(gamestate: &mut GameState, deck: Entity) -> Outcome {
    if let Some(deck_component) = gamestate.decks.get_mut(deck) {
        deck_component.shuffle();
    }
    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, deck);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
        players: None,
    }
}

pub fn collect_deck(gamestate: &mut GameState, deck_id: DeckId, x1: i64, y1: i64) -> Outcome {
    let orig_entities = gamestate.entities.clone();

    let mut card_inits: Vec<CardInit> = Vec::new();
    let mut modified_entities: Vec<Entity> = Vec::new();
    let mut removed_entities: Vec<Entity> = Vec::new();

    orig_entities.iter().for_each(|&entity| {
        if let Some(card) = gamestate.cards.get(entity) {
            if card.deck_id == deck_id {
                card_inits.push(CardInit(card.suit.clone(), card.rank, entity));
                removed_entities.push(entity);
                Card::remove(gamestate, entity);
            }
        }
        if let Some(deck) = gamestate.decks.get(entity) {
            if deck.deck_id == deck_id {
                card_inits.append(&mut deck.card_inits.clone());
                removed_entities.push(entity);
                Deck::remove(gamestate, entity);
            }
        }
        if let Some(hand) = gamestate.hands.get(entity) {
            let mut hand_cards: Vec<HandCard> = Vec::new();
            hand.cards.iter().for_each(|hand_card| {
                if hand_card.deck_id == deck_id {
                    card_inits.push(CardInit(
                        hand_card.suit.clone(),
                        hand_card.rank,
                        hand_card.id,
                    ));
                } else {
                    hand_cards.push(hand_card.clone());
                }
            });
            modified_entities.push(entity);
            gamestate.hands.register(
                entity,
                Hand {
                    cards: hand_cards,
                    client_id: hand.client_id,
                    nickname: hand.nickname.clone(),
                },
            );
        }
    });

    if card_inits.is_empty() {
        return Outcome::None;
    }

    let new_deck = Deck::new(deck_id, card_inits);
    let new_deck = Deck::add(
        gamestate,
        (new_deck, NearestEmptyPosition::bfs(gamestate, x1, y1)),
    );

    let mut dstate = GameState::new();
    for entity in modified_entities {
        dstate.clone_entity_from(gamestate, entity);
    }
    dstate.clone_entity_from(gamestate, new_deck);

    Outcome::Delta {
        changed: Some(dstate),
        deleted: match removed_entities.is_empty() {
            true => None,
            false => Some(removed_entities),
        },
        players: None,
    }
}

pub fn deal_deck_single(gamestate: &mut GameState, deck: Entity) -> Outcome {
    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let hands: Vec<Entity> = gamestate
        .entities
        .iter()
        .filter(|x| gamestate.hands.get(**x).is_some())
        .cloned()
        .collect();

    let mut is_empty = false;
    for hand in &hands {
        let hand_component = gamestate.hands.get_mut(*hand).unwrap();
        let card = match deck_component.draw_card() {
            Some(card) => card,
            None => {
                is_empty = true;
                break;
            }
        };
        hand_component.cards.push(HandCard {
            id: card.2,
            suit: card.0,
            rank: card.1,
            shown: false,
            deck_id: deck_component.deck_id,
        });
    }

    if is_empty {
        Deck::remove(gamestate, deck);
    }

    let mut dstate = GameState::new();
    dstate.clone_entity_from(gamestate, deck);
    for hand in hands {
        dstate.clone_entity_from(gamestate, hand);
    }

    Outcome::Delta {
        changed: Some(dstate),
        deleted: if is_empty { Some(vec![deck]) } else { None },
        players: None,
    }
}

pub fn deal_deck_all(gamestate: &mut GameState, deck: Entity) -> Outcome {
    let deck_component = match gamestate.decks.get_mut(deck) {
        Some(deck) => deck,
        None => return Outcome::Invalid(InvalidOutcomeError::EntityNotFound),
    };

    let hands: Vec<Entity> = gamestate
        .entities
        .iter()
        .filter(|x| gamestate.hands.get(**x).is_some())
        .cloned()
        .collect();

    let mut i = 0;
    while let Some(card) = deck_component.draw_card() {
        let hand = hands[i % hands.len()];
        let hand_component = gamestate.hands.get_mut(hand).unwrap();
        hand_component.cards.push(HandCard {
            id: card.2,
            suit: card.0,
            rank: card.1,
            shown: false,
            deck_id: deck_component.deck_id,
        });
        i += 1;
    }

    Deck::remove(gamestate, deck);
    let mut dstate = GameState::new();
    for hand in hands {
        dstate.clone_entity_from(gamestate, hand);
    }

    Outcome::Delta {
        changed: Some(dstate),
        deleted: Some(vec![deck]),
        players: None,
    }
}
