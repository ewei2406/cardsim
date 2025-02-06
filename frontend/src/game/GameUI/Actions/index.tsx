import { useSendMessage } from "@/context/useSendMessage";
import { GameSelection, useSelection } from "@/hooks/useSelection";
import { SendMessage } from "@/util/types/ClientRequest";
import ActionButton, { ActionProps } from "./ActionButton";
import { getCardActions } from "./CardActions/getCardActions";
import { getDeckActions } from "./DeckActions/getDeckActions";
import DeckSelector from "./GameBoardActions/NewDeck";
import { ReactNode, useEffect, useState } from "react";
import getGameBoardActions from "./GameBoardActions/getGameBoardActions";
import CutDeck from "./DeckActions/CutDeck";

export type GetActions<T = unknown> = (
	selection: GameSelection & T,
	sendMessage: SendMessage,
	openModal: (modal: ActionModal) => void
) => ActionProps[];

const getActions: GetActions = (selection, sendMessage, openModal) => {
	const actions = [];
	switch (selection.type) {
		case "cards":
			actions.push(...getCardActions(selection, sendMessage, openModal));
			break;
		case "deck":
			actions.push(...getDeckActions(selection, sendMessage, openModal));
			break;
		case "gameBoard":
			actions.push(...getGameBoardActions(selection, sendMessage, openModal));
			break;
		default:
			return [];
	}
	return actions;
};

export type ActionModal = "newDeck" | "cutDeck" | "none";
export type ActionModalComponent = (props: { close: () => void }) => ReactNode;

const BoardActions = () => {
	const sendMessage = useSendMessage();
	const selection = useSelection();

	const [curModal, setCurModal] = useState<ActionModal>("none");
	const [actions, setActions] = useState<ActionProps[]>(
		getActions(selection, sendMessage, setCurModal)
	);

	useEffect(() => {
		setActions(getActions(selection, sendMessage, setCurModal));
		setCurModal("none");
	}, [selection, sendMessage]);

	const closeModal = () => {
		setCurModal("none");
	};

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				bottom: 0,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				userSelect: "none",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				Actions
				{actions.map((action) => (
					<ActionButton key={action.label} {...action} />
				))}
			</div>

			{curModal === "cutDeck" ? (
				<CutDeck close={closeModal} />
			) : curModal === "newDeck" ? (
				<DeckSelector close={closeModal} />
			) : (
				<></>
			)}
		</div>
	);
};

export default BoardActions;
