import { DeckGroup, EntityId } from "../../../../util/GameState";
import { GameSelection } from "../../../../hooks/useSelection";
import { TableCardProps } from "./TableCard";

const getTableDeckCard = (
	deck: DeckGroup,
	selected: boolean
): TableCardProps => {
	const stackHeight =
		deck.deck.card_count > 4
			? Math.floor(deck.deck.card_count / 10) + 4
			: deck.deck.card_count;

	return {
		tableCard: {
			type: "Hidden",
			deck_id: deck.deck.deck_id,
		},
		id: deck.deck.next_card,
		x: deck.position.x,
		y: deck.position.y,
		selected,
		transform: `translateZ(${3 * stackHeight - 3}px)`,
		style: {
			zIndex: -1,
		},
	};
};

// The card on the top of the deck for the animation
const getTableDeckCards = (
	decks: { [id: EntityId]: DeckGroup },
	selection: GameSelection
) =>
	Object.values(decks).map((deck) =>
		getTableDeckCard(
			deck,
			selection.type === "deck" && selection.deck.id === deck.id
		)
	);

export default getTableDeckCards;
