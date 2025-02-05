import { useSendMessage } from "@/context/useSendMessage";
import { GameSelection, useSelection } from "@/hooks/useSelection";
import { SendMessage } from "@/util/types/ClientRequest";
import CardActions from "./CardActions";
import DeckActions from "./DeckActions";
import GameBoardActions from "./GameBoardActions";

const BoardActionsWrapper = (props: { children: React.ReactNode }) => {
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
				{props.children ? "Actions" : ""}
				{props.children}
			</div>
		</div>
	);
};

const getActions = (selection: GameSelection, sendMessage: SendMessage) => {
	switch (selection.type) {
		case "gameBoard":
			return (
				<GameBoardActions selection={selection} sendMessage={sendMessage} />
			);
		case "deck":
			return <DeckActions selection={selection} sendMessage={sendMessage} />;
		case "cards":
			return <CardActions selection={selection} sendMessage={sendMessage} />;
		default:
			return;
	}
};

const BoardActions = () => {
	const sendMessage = useSendMessage();
	const { selection } = useSelection();
	const actions = getActions(selection, sendMessage);

	return <BoardActionsWrapper>{actions}</BoardActionsWrapper>;
};

export default BoardActions;
