use super::action::Outcome;
use crate::component::{CardInit, DeckId, GroupedComponent, Hand, HandCard, Suit};
use crate::{
    component::{Card, Deck},
    entity::Entity,
    gamestate::GameState,
    util::get_id,
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
                card_inits.push(CardInit(suit.clone(), *rank));
            }
        }
        if jokers {
            card_inits.push(CardInit(Suit::J, 14));
            card_inits.push(CardInit(Suit::J, 15));
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
    let position = gamestate.nearest_empty_position(x, y);
    let deck = Deck::new(get_id(), card_inits);
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
    if n == 0 {
        return Outcome::None;
    }
    let position = match gamestate.positions.get(deck) {
        Some(position) => gamestate.nearest_empty_position(position.x, position.y),
        None => return Outcome::None,
    };
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

    let orig_id = deck_component.deck_id;
    let new_deck = Deck {
        deck_id: orig_id,
        card_inits: flipped,
        shuffle_ctr: 0,
    };

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

pub fn flip_cards_from_deck(
    gamestate: &mut GameState,
    deck: Entity,
    n: usize,
    faceup: bool,
) -> Outcome {
    if n == 0 {
        return Outcome::None;
    }
    let dy = if faceup { 0 } else { -2 };
    let dx = if faceup { 2 } else { 0 };
    let position = match gamestate.positions.get(deck) {
        Some(position) => gamestate.nearest_empty_position(position.x + dx, position.y + dy),
        None => return Outcome::None,
    };
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
            faceup,
            deck_id: deck_component.deck_id,
        })
        .collect();

    let card_entities: Vec<Entity> = cards
        .into_iter()
        .map(|card| Card::add(gamestate, (card, position.clone())))
        .collect();
    let mut dstate = GameState::new();
    for entity in card_entities {
        dstate.clone_entity_from(gamestate, entity);
    }
    dstate.clone_entity_from(gamestate, deck);
    Outcome::Delta {
        changed: Some(dstate),
        deleted: None,
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
                card_inits.push(CardInit(card.suit.clone(), card.rank));
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
                    card_inits.push(CardInit(hand_card.suit.clone(), hand_card.rank));
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
                },
            );
        }
    });

    if card_inits.is_empty() {
        return Outcome::None;
    }

    let new_deck = Deck {
        deck_id,
        card_inits,
        shuffle_ctr: 0,
    };
    let new_deck = Deck::add(
        gamestate,
        (new_deck, gamestate.nearest_empty_position(x1, y1)),
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
