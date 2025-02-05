import { useState } from "react";
import { useDrag } from "../../../../hooks/useDrag";
import { useSelect, useSelection } from "../../../../hooks/useSelection";
import { CardGroup, EntityId } from "../../../../util/GameState";
import TableCard from ".";

const TableCardWrapper = ({
	card,
	selected,
}: {
	card: CardGroup;
	selected: boolean;
}) => {
	const { startDrag, hoverDrag, finishDrag } = useDrag();
	const { addSelection } = useSelect();
	const [hover, setHover] = useState(false);

	return (
		<TableCard
			key={card.id}
			tableCard={card.card}
			x={card.position.x}
			y={card.position.y}
			selected={selected}
			hovered={hover}
			onClick={(e) => {
				addSelection({
					type: "card",
					card,
				});
				e.stopPropagation();
			}}
			onMouseDown={(e) => {
				if (e.button === 0) {
					startDrag({ type: "card", ...card });
					e.stopPropagation();
				}
			}}
			onMouseEnter={() => {
				setHover(true);
			}}
			onMouseOver={(e) => {
				if (e.button === 0) {
					hoverDrag({ type: "card", ...card });
					e.stopPropagation();
				}
			}}
			onMouseLeave={() => {
				setHover(false);
			}}
			onMouseUp={(e) => {
				if (e.button === 0) {
					finishDrag({ type: "card", ...card });
					e.stopPropagation();
				}
			}}
		/>
	);
};

const TableCards = ({ cards }: { cards: { [id: EntityId]: CardGroup } }) => {
	const { selection } = useSelection();

	const ids =
		selection.type === "cards" ? selection.cards.map((c) => c.id) : [];

	return (
		<>
			{Object.values(cards).map((card) => (
				<TableCardWrapper
					card={card}
					key={card.id}
					selected={ids.includes(card.id)}
				/>
			))}
		</>
	);
};

export default TableCards;
