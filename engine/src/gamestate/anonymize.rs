use crate::entity::Entity;

use super::GameState;

struct AnonGameState {
	entities: HashSet<Entity>,
	positions: ComponentStorage<Position>,
	cards: ComponentStorage<Card>,
	anon_cards: ComponentStorage<AnonCard>,
	anon_decks: ComponentStorage<AnonDeck>,
	hands: ComponentStorage<Hand>,
}

impl GameState {
	pub fn anonymize(&mut self, hand: Entity) -> GameState {

	}
}