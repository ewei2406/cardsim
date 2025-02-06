import { useEffect, useState } from "react";
import { TbScissors } from "react-icons/tb";
import { ActionModalComponent } from "..";
import { useSelection } from "@/hooks/useSelection";
import { useSendMessage } from "@/context/useSendMessage";
import Modal from "@/components/Modal";
import ActionButton from "../ActionButton";

const CutDeck: ActionModalComponent = ({ close }) => {
	const sendMessage = useSendMessage();
	const selection = useSelection();
	const [cutPosition, setCutPosition] = useState(1);
	useEffect(() => {
		setCutPosition(1);
	}, [selection]);

	if (selection.type !== "deck") return <></>;

	const handleCut = () => {
		sendMessage({
			type: "Action",
			action: "CutDeck",
			deck: selection.deck.id,
			n: cutPosition,
		});
		close();
	};

	return (
		<Modal close={close} title="Cut Deck">
			<div style={{ marginBottom: 10 }}>
				<div className="row">
					<label htmlFor="cutPosition">Cut Depth:</label>
					<div className="row">
						{cutPosition}/{selection.deck.deck.card_count}
						<input
							type="range"
							id="cutPosition"
							name="cutPosition"
							min={1}
							max={selection.deck.deck.card_count - 1}
							value={cutPosition}
							onChange={(e) => setCutPosition(parseInt(e.target.value))}
						/>
					</div>
				</div>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<ActionButton
					label="Cut Deck"
					icon={TbScissors}
					onClick={handleCut}
					hotKey="c"
					underlineIndex={0}
					highPriority
				/>
			</div>
		</Modal>
	);
};

export default CutDeck;
