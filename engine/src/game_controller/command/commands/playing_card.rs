use crate::entity;
use crate::game_table;

pub fn create_cards_stack(
    pos: entity::EntityPosition,
) -> Result<Vec<game_table::GameTableUpdate>, String> {
    let deck_id = entity::id();
    let mut updates: Vec<game_table::GameTableUpdate> = Vec::new();
    let suits = vec![
        entity::Suit::Hearts,
        entity::Suit::Spades,
        entity::Suit::Clubs,
        entity::Suit::Diamonds,
    ];

    // Ranked cards
    for suit in suits {
        for rank in 1..14 {
            let card =
                entity::PlayingCard::new(entity::id(), pos, suit.clone(), rank, deck_id, 0, 0);
            updates.push(game_table::GameTableUpdate::EntityAdded {
                entity: Box::new(card),
            });
        }
    }

    // Jokers
    let joker =
        entity::PlayingCard::new(entity::id(), pos, entity::Suit::Hearts, 14, deck_id, 0, 0);
    updates.push(game_table::GameTableUpdate::EntityAdded {
        entity: Box::new(joker),
    });

    let big_joker =
        entity::PlayingCard::new(entity::id(), pos, entity::Suit::Hearts, 15, deck_id, 0, 0);
    updates.push(game_table::GameTableUpdate::EntityAdded {
        entity: Box::new(big_joker),
    });

    Ok(updates)
}

pub fn modify_cards_stack(
    table: &game_table::GameTable,
    depth: u64,
    pos: entity::EntityPosition,
    mut modify_fn: impl FnMut(&mut entity::PlayingCard),
) -> Result<Vec<game_table::GameTableUpdate>, String> {
    let entities = table.get_entities_pos(pos);
    let mut updates: Vec<game_table::GameTableUpdate> = Vec::new();
    for (i, entity) in entities.iter().enumerate() {
        if i as u64 >= depth {
            break;
        }
        if let Some(card) = entity.as_any().downcast_ref::<entity::PlayingCard>() {
            let mut card = card.clone();
            modify_fn(&mut card);
            updates.push(game_table::GameTableUpdate::EntityChanged {
                entity_id: card.id,
                new_entity: Box::new(card),
            });
        }
    }
    Ok(updates)
}

pub fn gather_cards_stack(
    table: &game_table::GameTable,
    pos: entity::EntityPosition,
    deck_id: u64,
) -> Result<Vec<game_table::GameTableUpdate>, String> {
    let mut updates: Vec<game_table::GameTableUpdate> = Vec::new();
    for entity in table.entities.iter() {
        if let Some(card) = entity.as_any().downcast_ref::<entity::PlayingCard>() {
            if card.deck_id == deck_id {
                let mut card = card.clone();
                card.hand_id = 0;
                card.position = pos;
                updates.push(game_table::GameTableUpdate::EntityChanged {
                    entity_id: card.id,
                    new_entity: Box::new(card),
                });
            }
        }
    }
    Ok(updates)
}
