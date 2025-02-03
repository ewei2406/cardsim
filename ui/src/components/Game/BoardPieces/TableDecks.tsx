import { useMemo } from "react";
import { Deck, Position } from "../../../hooks/useClient/ServerResponse";
import { DragTarget, useDrag } from "../../../hooks/useDrag";
import { DeckGroup, Id } from "../../../hooks/useGame";
import { useSelect, useSelection } from "../../../hooks/useSelection";
import { TILE_SIZE } from "../../../util/constants";
import CardBack from "../../CardPiece";
import BoardPiece from "./BoardPiece";

const TableDeck = ({
	deck,
	selected,
}: {
	deck: DeckGroup;
	selected?: boolean;
}) => {
	const { startDrag, hoverDrag, finishDrag } = useDrag();
	const { select } = useSelect();

	const stackHeight =
		deck.card_count > 4
			? Math.floor(deck.card_count / 10) + 4
			: deck.card_count;

	const dragTarget: DragTarget = useMemo(
		() => ({
			type: "deck",
			entityId: deck.id,
			x: deck.x,
			y: deck.y,
		}),
		[deck]
	);

	return (
		<BoardPiece
			x={deck.x}
			y={deck.y}
			onMouseDown={(e) => {
				if (e.button === 0) {
					startDrag(dragTarget);
				}
			}}
			onMouseOver={(e) => {
				if (e.button === 0) {
					hoverDrag(dragTarget);
				}
			}}
			onMouseUp={(e) => {
				if (e.button === 0) {
					finishDrag(dragTarget);
				}
			}}
			onClick={() => {
				select({
					type: "deck",
					deck,
				});
			}}
		>
			<CardBack
				width={TILE_SIZE * 1.5}
				deck_id={deck.deck_id}
				selected={selected}
			/>

			{Array.from({ length: stackHeight }).map((_, index) => (
				<div
					key={index}
					style={{
						position: "relative",
						marginTop: -TILE_SIZE * 2.25,
						transform: `translateZ(${3 * index}px)`,
					}}
				>
					<CardBack width={TILE_SIZE * 1.5} deck_id={deck.deck_id} />
				</div>
			))}

			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					transform: `translateZ(${3 * stackHeight + 2}px)`,
				}}
			>
				{deck.card_count}
			</div>
		</BoardPiece>
	);
};

const TableDecks = ({ decks }: { decks: (Deck & Position & Id)[] }) => {
	const { selection } = useSelection();
	return (
		<>
			{decks.map((deck) => (
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
