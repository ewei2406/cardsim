import useGame from "../../hooks/useGame";
import useLobby from "../../hooks/useLobby";
import GameBoard from "./GameBoard";
import BoardActions from "./BoardActions";
import GameBoardSelection from "./GameBoard/GameBoardSelection";
import GameBoardTiles from "./GameBoard/GameBoardTiles";
import LeaveGame from "./LeaveGame";
import TableDecks from "./BoardPieces/TableDecks";
import DragArrow from "./GameBoard/DragArrow";
import { GameState } from "../../hooks/useClient/ServerResponse";

const Game = ({
	initialGameState,
	gameId,
	onDelta,
	sendGameAction,
	leaveGame,
}: {
	initialGameState: GameState;
	gameId: number;
	onDelta: ReturnType<typeof useLobby>["onDelta"];
	sendGameAction: ReturnType<typeof useLobby>["sendGameAction"];
	leaveGame: ReturnType<typeof useLobby>["leaveGame"];
}) => {
	const game = useGame({
		onDelta: onDelta,
		sendGameAction: sendGameAction,
		gameId: gameId,
		initialGameState,
	});
	// const chat = useChat(onChatMessage, sendChatMessage);

	return (
		<div>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					display: "flex",
					justifyContent: "center",
				}}
			>
				Game: {gameId}
			</div>
			{/* <ChatBox chat={chat} nicknames={game.nicknames} /> */}
			<GameBoard>
				<GameBoardTiles />
				<DragArrow />
				<GameBoardSelection />
				<TableDecks decks={Object.values(game.decks)} />
			</GameBoard>
			<BoardActions game={game} />
			<LeaveGame leaveGame={leaveGame} />
		</div>
	);
};

export default Game;
