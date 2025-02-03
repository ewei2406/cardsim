import { useState } from "react";
import { useDrag } from "../../../hooks/useDrag";
import { useSelect, useSelection } from "../../../hooks/useSelection";
import { CARD_WIDTH } from "../../../util/constants";
import { CardGroup, EntityId } from "../../../util/GameState";
import CardBack from "../../Card/CardBack";
import CardFront from "../../Card/CardFront";
import BoardPiece from "./BoardPiece";

const TableCard = ({
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
		<BoardPiece
			x={card.position.x}
			y={card.position.y}
			dz={hover ? 5 : 0}
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
		>
			<div
				style={{
					position: "absolute",
					transform: `translate(-50%, -50%) rotateY(${
						card.card.type === "AnonCard" ? 360 : 180
					}deg)`,
					transition: "transform 0.2s ease",
					backfaceVisibility: "hidden",
				}}
			>
				<CardBack
					width={CARD_WIDTH}
					deck_id={card.card.deck_id}
					selected={selected}
				/>
			</div>

			<div
				style={{
					position: "absolute",
					transform: `translate(-50%, -50%) rotateY(${
						card.card.type === "AnonCard" ? 180 : 0
					}deg)`,
					transition: "transform 0.2s ease",
					backfaceVisibility: "hidden",
				}}
			>
				<CardFront
					width={CARD_WIDTH}
					deck_id={card.card.deck_id}
					rank={card.card.type === "Card" ? card.card.rank : 0}
					suit={card.card.type === "Card" ? card.card.suit : "S"}
					selected={selected}
				/>
			</div>
		</BoardPiece>
	);
};

const TableCards = ({ cards }: { cards: { [id: EntityId]: CardGroup } }) => {
	const { selection } = useSelection();

	console.log("HERE", selection);

	const ids =
		selection.type === "cards" ? selection.cards.map((c) => c.id) : [];

	return (
		<>
			{Object.values(cards).map((card) => (
				<TableCard card={card} key={card.id} selected={ids.includes(card.id)} />
			))}
		</>
	);
};

export default TableCards;
