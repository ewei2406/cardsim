import { TbCards, TbX } from "react-icons/tb";
import { useState } from "react";
import DeckSelector, { DeckProps } from "./DeckSelector";
import Modal from "@/components/Modal";
import { GameSelection, useSelect, selectionObject } from "@/hooks/useSelection";
import { COLORS } from "@/util/colors";
import { SendMessage } from "@/util/types/ClientRequest";

const GameBoardActions = ({
	selection,
	sendMessage,
}: {
	selection: GameSelection & { type: "gameBoard" };
	sendMessage: SendMessage;
}) => {
	const { deselect } = useSelect();

	const [showNewDeck, setShowNewDeck] = useState(false);

	const handleCreate = (deckProps: DeckProps) => {
		sendMessage({
			type: "Action",
			...deckProps,
			x: selection.x,
			y: selection.y,
		});
		setShowNewDeck(false);
		selectionObject.deselect();
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<button onClick={() => setShowNewDeck(true)}>
				<TbCards />
				Add Deck...
			</button>
			<button style={{ backgroundColor: COLORS.DARK }} onClick={deselect}>
				<TbX />
				Deselect
			</button>
			<Modal
				shown={showNewDeck}
				close={() => setShowNewDeck(false)}
				title="New Deck"
			>
				<DeckSelector handleCreate={handleCreate} />
			</Modal>
		</div>
	);
};

export default GameBoardActions;
