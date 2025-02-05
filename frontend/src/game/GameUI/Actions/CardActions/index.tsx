import { TbEye, TbEyeOff, TbHandStop, TbX } from "react-icons/tb";
import { IoLayersOutline } from "react-icons/io5";
import { GameSelection, useSelect, selectionObject } from "@/hooks/useSelection";
import { COLORS } from "@/util/colors";
import { SendMessage } from "@/util/types/ClientRequest";

const CardActions = ({
	selection,
	sendMessage,
}: {
	selection: GameSelection & { type: "cards" };
	sendMessage: SendMessage;
}) => {
	const { deselect } = useSelect();

	const handleDelete = () => {
		sendMessage({
			type: "Action",
			action: "RemoveEntities",
			entities: selection.cards.map((card) => card.id),
		});
		selectionObject.deselect();
	};

	const handleFlip = (faceup: boolean) => {
		sendMessage({
			type: "Action",
			action: "FlipCards",
			cards: selection.cards.map((card) => card.id),
			faceup,
		});
	};

	const handlePickup = () => {
		sendMessage({
			type: "Action",
			action: "DrawCardsFromTable",
			cards: selection.cards.map((card) => card.id),
		});
		selectionObject.deselect();
	};

	let regroupId =
		selection.cards.length === 0 ? null : selection.cards[0].card.deck_id;
	selection.cards.forEach((card) => {
		if (card.card.deck_id !== regroupId) {
			regroupId = null;
		}
	});

	const handleRegroup = () => {
		if (!regroupId) {
			return;
		}
		sendMessage({
			type: "Action",
			action: "CollectDeck",
			deck_id: regroupId,
			x1: selection.cards[selection.cards.length - 1].position.x,
			y1: selection.cards[selection.cards.length - 1].position.y,
		});
		selectionObject.deselect();
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<button onClick={handlePickup}>
				<TbHandStop />
				Pick Up
			</button>
			<button onClick={() => handleFlip(false)}>
				<TbEyeOff />
				Facedown
			</button>
			<button onClick={() => handleFlip(true)}>
				<TbEye />
				Faceup
			</button>
			<button onClick={handleRegroup} disabled={!regroupId}>
				<IoLayersOutline />
				Regroup All
			</button>
			<button style={{ backgroundColor: COLORS.DARK }} onClick={deselect}>
				<TbX />
				Deselect
			</button>
			<button style={{ backgroundColor: COLORS.DANGER }} onClick={handleDelete}>
				<TbX />
				Delete
			</button>
		</div>
	);
};

export default CardActions;
