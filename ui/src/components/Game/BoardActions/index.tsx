import useGame from "../../../hooks/useGame";
import { useSelection, GameSelection } from "../../../hooks/useSelection";
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
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{props.children ? "Actions" : ""}
				{props.children}
			</div>
		</div>
	);
};

const getActions = (
	selection: GameSelection,
	game: ReturnType<typeof useGame>
) => {
	switch (selection.type) {
		case "gameBoard":
			return <GameBoardActions selection={selection} game={game} />;
		case "deck":
			return <DeckActions selection={selection} game={game} />;
		default:
			return;
	}
};

const BoardActions = (props: { game: ReturnType<typeof useGame> }) => {
	const { selection } = useSelection();

	const actions = getActions(selection, props.game);

	return <BoardActionsWrapper>{actions}</BoardActionsWrapper>;
};

export default BoardActions;
