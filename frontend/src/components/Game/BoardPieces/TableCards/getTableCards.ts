import { dragObject } from "../../../../hooks/useDrag";
import { GameSelection, selectionObject } from "../../../../hooks/useSelection";
import { CardGroup, EntityId } from "../../../../util/GameState";
import { TableCardProps } from "./TableCard";

const getTableCardWrapper = (
	card: CardGroup,
	selected: boolean
): TableCardProps => {
	const { startDrag, hoverDrag, finishDrag } = dragObject;
	const { addSelection } = selectionObject;
	return {
		id: card.id,
		className: "lift-hover",
		tableCard: card.card,
		x: card.position.x,
		y: card.position.y,
		selected,
		onClick: (e) => {
			addSelection({
				type: "card",
				card,
			});
			e.stopPropagation();
		},
		onMouseDown: (e) => {
			if (e.button === 0) {
				startDrag({ type: "card", ...card });
				e.stopPropagation();
			}
		},
		onMouseOver: (e) => {
			if (e.button === 0) {
				hoverDrag({ type: "card", ...card });
				e.stopPropagation();
			}
		},
		onMouseUp: (e) => {
			if (e.button === 0) {
				finishDrag({ type: "card", ...card });
				e.stopPropagation();
			}
		},
	};
};

const getTableCards = (
	cards: { [id: EntityId]: CardGroup },
	selection: GameSelection
) => {
	const ids =
		selection.type === "cards" ? selection.cards.map((c) => c.id) : [];
	return Object.values(cards).map((card) =>
		getTableCardWrapper(card, ids.includes(card.id))
	);
};

export default getTableCards;
