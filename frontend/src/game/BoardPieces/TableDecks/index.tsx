import { useState } from "react";
import CardCount from "./CardCount";
import CardBack from "@/components/Card/CardBack";
import { useDrag } from "@/hooks/useDrag";
import { useSelect, useSelection } from "@/hooks/useSelection";
import { CARD_WIDTH } from "@/util/constants";
import { DeckGroup, EntityId } from "@/util/GameState";
import BoardPiece from "../BoardPiece";

const TableDeck = ({
	deck,
	selected,
}: {
	deck: DeckGroup;
	selected?: boolean;
}) => {
	const { startDrag, hoverDrag, finishDrag } = useDrag();
	const { addSelection } = useSelect();
	const [showCount, setShowCount] = useState(false);

	const stackHeight =
		deck.deck.card_count > 4
			? Math.floor(deck.deck.card_count / 10) + 4
			: deck.deck.card_count;

	return (
		<BoardPiece
			x={deck.position.x}
			y={deck.position.y}
			onMouseDown={(e) => {
				if (e.button === 0) {
					startDrag({ type: "deck", ...deck });
					e.stopPropagation();
				}
			}}
			onMouseEnter={(e) => {
				if (e.button === 0) {
					setShowCount(true);
					hoverDrag({ type: "deck", ...deck });
					e.stopPropagation();
				}
			}}
			onMouseOver={(e) => {
				if (e.button === 0) {
					hoverDrag({ type: "deck", ...deck });
					e.stopPropagation();
				}
			}}
			onMouseLeave={() => {
				setShowCount(false);
			}}
			onMouseUp={(e) => {
				if (e.button === 0) {
					finishDrag({ type: "deck", ...deck });
					e.stopPropagation();
				}
			}}
			onClick={(e) => {
				addSelection({
					type: "deck",
					deck,
				});
				e.stopPropagation();
			}}
		>
			{Array.from({ length: stackHeight }).map((_, index) => (
				<div
					key={index}
					style={{
						position: "absolute",
						transition: "transform 0.3s",
						transitionDelay: `${index * 0.05}s`,
						transform: `translate(-50%, -50%) translateZ(${
							3 * index
						}px) rotateZ(${deck.deck.shuffle_ctr % 2 ? 360 : 0}deg)`,
					}}
				>
					<CardBack
						width={CARD_WIDTH}
						deck_id={deck.deck.deck_id}
						selected={selected}
					/>
				</div>
			))}

			{(showCount || selected) && (
				<CardCount count={deck.deck.card_count} height={3 * stackHeight} />
			)}
		</BoardPiece>
	);
};

const TableDecks = ({ decks }: { decks: { [id: EntityId]: DeckGroup } }) => {
	const { selection } = useSelection();
	return (
		<>
			{Object.values(decks).map((deck) => (
				<TableDeck
					deck={deck}
					key={deck.id}
					selected={selection.type === "deck" && selection.deck.id === deck.id}
				/>
			))}
		</>
	);
};

export default TableDecks;
