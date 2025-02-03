import {
	TbArrowFork,
	TbArrowForwardUp,
	TbArrowsShuffle,
	TbArrowUp,
	TbScissors,
	TbX,
} from "react-icons/tb";
import { GameSelection, useSelect } from "../../../../hooks/useSelection";
import { useState } from "react";
import Modal from "../../../Modal";
import useGame from "../../../../hooks/useGame";
import { RiFireLine } from "react-icons/ri";
import { IoLayersOutline } from "react-icons/io5";
import CutDeck from "./CutDeck";
import { COLORS } from "../../../../util/colors";

const DeckActions = ({
	selection,
	game,
}: {
	selection: GameSelection & { type: "deck" };
	game: ReturnType<typeof useGame>;
}) => {
	const [showCut, setShowCut] = useState(false);
	const { deselect } = useSelect();

	const handleCut = (n: number) => {
		game.sendGameAction({
			type: "Action",
			action: "CutDeck",
			deck: selection.deck.id,
			n,
		});
		setShowCut(false);
		deselect();
	};

	const handleFlip = () => {
		game.sendGameAction({
			type: "Action",
			action: "FlipCardsFromDeck",
			n: 1,
			faceup: true,
			deck: selection.deck.id,
		});
	};

	const handleBurn = () => {
		game.sendGameAction({
			type: "Action",
			action: "FlipCardsFromDeck",
			n: 1,
			faceup: false,
			deck: selection.deck.id,
		});
	};

	const handleShuffle = () => {
		game.sendGameAction({
			type: "Action",
			action: "ShuffleDeck",
			deck: selection.deck.id,
		});
	};

	const handleRegroup = () => {
		game.sendGameAction({
			type: "Action",
			action: "CollectDeck",
			deck_id: selection.deck.deck_id,
			x1: selection.deck.x,
			y1: selection.deck.y,
		});
	};

	const handleDelete = () => {
		game.sendGameAction({
			type: "Action",
			action: "RemoveEntity",
			entity: selection.deck.id,
		});
	};

	const handleDrawCard = () => {
		game.sendGameAction({
			type: "Action",
			action: "DrawCardFromDeck",
			deck: selection.deck.id,
		});
	};

	const isSingleCard = selection.deck.card_count < 1;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<button onClick={() => setShowCut(true)} disabled={isSingleCard}>
				<TbScissors />
				Cut Deck...
			</button>
			<button onClick={handleFlip}>
				<TbArrowForwardUp />
				Flip Card
			</button>
			<button onClick={handleBurn}>
				<RiFireLine />
				Burn Card
			</button>
			<button onClick={handleShuffle} disabled={isSingleCard}>
				<TbArrowsShuffle />
				Shuffle
			</button>
			<button onClick={() => setShowCut(true)}>
				<TbArrowFork />
				Deal Card
			</button>
			<button onClick={() => setShowCut(true)}>
				<TbArrowFork />
				Deal All
			</button>
			<button onClick={handleRegroup}>
				<IoLayersOutline />
				Regroup All
			</button>
			<button onClick={handleDrawCard}>
				<TbArrowUp />
				Draw Card
			</button>
			<button style={{ backgroundColor: COLORS.DARK }} onClick={deselect}>
				<TbX />
				Deselect
			</button>
			<button style={{ backgroundColor: COLORS.DANGER }} onClick={handleDelete}>
				<TbX />
				Delete Deck
			</button>
			<Modal shown={showCut} close={() => setShowCut(false)} title="Cut Deck">
				{<CutDeck deck={selection.deck} handleCut={handleCut} />}
			</Modal>
		</div>
	);
};

export default DeckActions;
