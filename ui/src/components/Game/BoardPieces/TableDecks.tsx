import { Deck, Position } from "../../../hooks/useClient/ServerResponse";
import { Id } from "../../../hooks/useGame";
import { useSelect, useSelection } from "../../../hooks/useSelection";
import { TILE_SIZE } from "../../../util/constants";
import CardBack from "../../CardPiece";
import BoardPiece from "./BoardPiece";

const TableDeck = ({
	deck,
	selected,
}: {
	deck: Deck & Position & Id;
	selected?: boolean;
}) => {
	const { select } = useSelect();

	const stackHeight =
		deck.card_count > 4
			? Math.floor(deck.card_count / 10) + 4
			: deck.card_count;

	return (
		<BoardPiece
			x={deck.x}
			y={deck.y}
			onClick={() => {
				select({
					type: "deck",
					entityId: deck.id,
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
		</BoardPiece>
	);
};

const TableDecks = ({ decks }: { decks: (Deck & Position & Id)[] }) => {
	const { selection } = useSelection();
	console.log(selection);
	return (
		<>
			{decks.map((deck) => (
				<TableDeck
					deck={deck}
					key={deck.id}
					selected={selection.type === "deck" && selection.entityId === deck.id}
				/>
			))}
		</>
	);
};

export default TableDecks;
