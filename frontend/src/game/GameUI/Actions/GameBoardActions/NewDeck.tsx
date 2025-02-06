import Toggle from "@/components/Toggle";
import { useSendMessage } from "@/context/useSendMessage";
import { selectionObject, useSelection } from "@/hooks/useSelection";
import { useState } from "react";
import { TbCards } from "react-icons/tb";
import Modal from "@/components/Modal";
import { ActionModalComponent } from "..";
import ActionButton from "../ActionButton";

export type DeckProps =
	| {
			action: "CreateStandardDecks";
			n: number;
			jokers: boolean;
	  }
	| {
			action: "CreateDeck";
			card_inits: [string, number][];
	  };

const NewDeck: ActionModalComponent = ({ close }) => {
	const selection = useSelection();
	const sendMessage = useSendMessage();
	const [deckProps, setDeckProps] = useState<DeckProps>({
		action: "CreateStandardDecks",
		n: 1,
		jokers: true,
	});

	if (selection.type !== "gameBoard") return <></>;

	const handleCreate = () => {
		sendMessage({
			type: "Action",
			...deckProps,
			x: selection.x,
			y: selection.y,
		});
		close();
		selectionObject.deselect();
	};

	return (
		<Modal title="New Deck" close={close}>
			<div className="column" style={{ marginBottom: 10 }}>
				<div className="row">
					Deck Type
					<select
						value={deckProps.action}
						onChange={(e) => {
							const value = e.target.value as
								| "CreateStandardDecks"
								| "CreateDeck";
							if (value === "CreateStandardDecks") {
								setDeckProps({ action: value, n: 1, jokers: true });
							} else {
								setDeckProps({ action: value, card_inits: [] });
							}
						}}
					>
						<option value="CreateStandardDecks">Standard Deck</option>
						<option value="CreateDeck">Custom Deck</option>
					</select>
				</div>
				{deckProps.action === "CreateStandardDecks" ? (
					<>
						<div className="row">
							Number of Decks
							<input
								style={{
									width: "50px",
								}}
								type="number"
								value={deckProps.n}
								onChange={(e) =>
									setDeckProps({
										...deckProps,
										n: Math.max(+e.target.value, 1),
									})
								}
							/>
						</div>
						<div className="row">
							Jokers
							<Toggle
								checked={deckProps.jokers}
								onChange={(checked) =>
									setDeckProps({ ...deckProps, jokers: checked })
								}
							/>
						</div>
					</>
				) : (
					<>
						<div className="row"></div>
					</>
				)}
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<ActionButton
					label="New Deck"
					icon={TbCards}
					onClick={handleCreate}
					hotKey="d"
					underlineIndex={4}
					highPriority
				/>
			</div>
		</Modal>
	);
};

export default NewDeck;
