import { dragObject } from "@/hooks/useDrag";
import { selectionObject, GameSelection } from "@/hooks/useSelection";
import { CardGroup, EntityId } from "@/util/GameState";
import { TableCardProps } from "./TableCard";

const getTableCardWrapper = (
	card: CardGroup,
	selected: boolean,
	mini: boolean
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
		onDoubleClick: (e) => {
			e.stopPropagation();
			selectionObject.bfsSelect(card);
		},
		mini,
	};
};

const getTableCards = (
	cards: { [id: EntityId]: CardGroup },
	selection: GameSelection,
	mini: boolean
) => {
	const ids =
		selection.type === "cards" ? selection.cards.map((c) => c.id) : [];
	return Object.values(cards).map((card) =>
		getTableCardWrapper(card, ids.includes(card.id), mini)
	);
};

export default getTableCards;
