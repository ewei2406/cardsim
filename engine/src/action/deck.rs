use crate::{
    component::{Card, Deck, Position},
    entity::Entity,
    gamestate::GameState,
};

pub fn create_deck(gamestate: &mut GameState, position: Position) -> Entity {
    let deck = Deck::new(gamestate.get_entity());
    gamestate.add_deck(deck, position)
}

// Move the top n cards of a deck onto another spot
pub fn cut_deck(
    gamestate: &mut GameState,
    deck: Entity,
    n: usize,
    position: Position,
) -> Option<Entity> {
    if n == 0 {
        return None;
    }

    let deck_component = gamestate.decks.get_mut(deck)?;
    let mut flipped = Vec::new();
    for _ in 0..n {
        match deck_component.draw_card() {
            Some(card) => flipped.push(card),
            None => break,
        }
    }

    if flipped.is_empty() {
        gamestate.mark_dead(deck);
        return None;
    }

    let orig_id = deck_component.deck_id;
    let new_deck = Deck {
        deck_id: orig_id,
        card_inits: flipped,
    };
    Some(gamestate.add_deck(new_deck, position))
}

pub fn flip_cards_from_deck(
    gamestate: &mut GameState,
    deck: Entity,
    n: usize,
    position: Position,
) -> Option<Vec<Entity>> {
    if n == 0 {
        return None;
    }

    let deck_component = gamestate.decks.get_mut(deck)?;
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
            rank: card_init.rank,
            suit: card_init.suit.clone(),
            faceup: true,
            deck_id: deck_component.deck_id,
        })
        .collect();

    let card_entities: Vec<Entity> = cards
        .into_iter()
        .map(|card| gamestate.add_card(card, position.clone()))
        .collect();

    Some(card_entities)
}

pub fn shuffle_deck(gamestate: &mut GameState, deck: Entity) {
    if let Some(deck_component) = gamestate.decks.get_mut(deck) {
        deck_component.shuffle();
    }
}
