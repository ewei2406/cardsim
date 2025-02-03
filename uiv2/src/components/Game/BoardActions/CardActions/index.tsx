import { TbEye, TbEyeOff, TbX } from "react-icons/tb";
import { SendMessage } from "../../../../util/types/ClientRequest";
import { GameSelection, useSelect } from "../../../../hooks/useSelection";
import { COLORS } from "../../../../util/colors";

const CardActions = ({
	selection,
	sendMessage,
}: {
	selection: GameSelection & { type: "cards" };
	sendMessage: SendMessage;
}) => {
	const { deselect } = useSelect();

	const plural = selection.cards.length > 1 ? "Cards" : "Card";

	// TODO: Make this a group action
	const handleDelete = () => {
		selection.cards.forEach((card) => {
			sendMessage({
				type: "Action",
				action: "RemoveEntity",
				entity: card.id,
			});
		});
		deselect();
	};

	const handleFlip = (faceup: boolean) => {
		sendMessage({
			type: "Action",
			action: "FlipCards",
			cards: selection.cards.map((card) => card.id),
			faceup,
		});
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<button onClick={() => handleFlip(false)}>
				<TbEyeOff />
				Flip Facedown
			</button>
			<button onClick={() => handleFlip(true)}>
				<TbEye />
				Flip Faceup
			</button>
			<button style={{ backgroundColor: COLORS.DARK }} onClick={deselect}>
				<TbX />
				Deselect
			</button>
			<button style={{ backgroundColor: COLORS.DANGER }} onClick={handleDelete}>
				<TbX />
				Delete {plural}
			</button>
		</div>
	);
};

export default CardActions;
