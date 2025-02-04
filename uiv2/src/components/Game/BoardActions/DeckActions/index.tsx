import {
	TbArrowFork,
	TbArrowForwardUp,
	TbArrowsShuffle,
	TbArrowUp,
	TbScissors,
	TbX,
} from "react-icons/tb";
import { useState } from "react";
import { RiFireLine } from "react-icons/ri";
import { IoLayersOutline } from "react-icons/io5";
import CutDeck from "./CutDeck";
import { COLORS } from "../../../../util/colors";
import { SendMessage } from "../../../../util/types/ClientRequest";
import { GameSelection, useSelect } from "../../../../hooks/useSelection";
import Modal from "../../../Modal";

const DeckActions = ({
	selection,
	sendMessage,
}: {
	selection: GameSelection & { type: "deck" };
	sendMessage: SendMessage;
}) => {
	const [showCut, setShowCut] = useState(false);
	const { deselect } = useSelect();

	const handleCut = (n: number) => {
		sendMessage({
			type: "Action",
			action: "CutDeck",
			deck: selection.deck.id,
			n,
		});
		setShowCut(false);
		deselect();
	};

	const handleFlip = () => {
		sendMessage({
			type: "Action",
			action: "FlipCardsFromDeck",
			n: 1,
			faceup: true,
			deck: selection.deck.id,
		});
	};

	const handleBurn = () => {
		sendMessage({
			type: "Action",
			action: "FlipCardsFromDeck",
			n: 1,
			faceup: false,
			deck: selection.deck.id,
		});
	};

	const handleShuffle = () => {
		sendMessage({
			type: "Action",
			action: "ShuffleDeck",
			deck: selection.deck.id,
		});
	};

	const handleRegroup = () => {
		sendMessage({
			type: "Action",
			action: "CollectDeck",
			deck_id: selection.deck.deck.deck_id,
			x1: selection.deck.position.x,
			y1: selection.deck.position.y,
		});
		deselect();
	};

	const handleDelete = () => {
		sendMessage({
			type: "Action",
			action: "RemoveEntity",
			entity: selection.deck.id,
		});
		deselect();
	};

	const handleDrawCard = () => {
		sendMessage({
			type: "Action",
			action: "DrawCardFromDeck",
			deck: selection.deck.id,
		});
	};

	const isSingleCard = selection.deck.deck.card_count <= 1;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<button onClick={handleDrawCard}>
				<TbArrowUp />
				Draw
			</button>
			<button onClick={handleFlip}>
				<TbArrowForwardUp />
				Flip
			</button>
			<button onClick={handleBurn}>
				<RiFireLine />
				Burn
			</button>
			<button onClick={handleShuffle} disabled={isSingleCard}>
				<TbArrowsShuffle />
				Shuffle
			</button>
			<button onClick={() => setShowCut(true)}>
				<TbArrowFork />
				Deal One
			</button>
			<button onClick={() => setShowCut(true)}>
				<TbArrowFork />
				Deal All
			</button>
			<button onClick={handleRegroup}>
				<IoLayersOutline />
				Regroup All
			</button>
			<button onClick={() => setShowCut(true)} disabled={isSingleCard}>
				<TbScissors />
				Cut...
			</button>
			<button style={{ backgroundColor: COLORS.DARK }} onClick={deselect}>
				<TbX />
				Deselect
			</button>
			<button style={{ backgroundColor: COLORS.DANGER }} onClick={handleDelete}>
				<TbX />
				Delete
			</button>
			<Modal shown={showCut} close={() => setShowCut(false)} title="Cut Deck">
				{<CutDeck deck={selection.deck} handleCut={handleCut} />}
			</Modal>
		</div>
	);
};

export default DeckActions;
