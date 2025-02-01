import { TbCards, TbX } from "react-icons/tb";
import { COLORS } from "../../../../util/colors";
import { GameSelection, useSelect } from "../../../../hooks/useSelection";
import { useState } from "react";
import Modal from "../../../Modal";
import useGame from "../../../../hooks/useGame";
import DeckSelector, { DeckProps } from "./DeckSelector";

const GameBoardActions = (props: {
	selection: GameSelection & { type: "gameBoard" };
	game: ReturnType<typeof useGame>;
}) => {
	const { deselect } = useSelect();

	const [showNewDeck, setShowNewDeck] = useState(false);

	const handleCreate = (deckProps: DeckProps) => {
		props.game.sendGameAction({
			type: "Action",
			...deckProps,
			x: props.selection.x,
			y: props.selection.y,
		});
		setShowNewDeck(false);
		deselect();
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<button onClick={() => setShowNewDeck(true)}>
				<TbCards />
				Add Deck
			</button>
			<button style={{ backgroundColor: COLORS.DANGER }} onClick={deselect}>
				<TbX />
				Deselect
			</button>
			<Modal
				shown={showNewDeck}
				close={() => setShowNewDeck(false)}
				title="New Deck"
			>
				<DeckSelector game={props.game} handleCreate={handleCreate} />
			</Modal>
		</div>
	);
};

export default GameBoardActions;
