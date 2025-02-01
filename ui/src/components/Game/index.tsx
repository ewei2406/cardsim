import { useChat } from "../../hooks/useChat";
import useGame from "../../hooks/useGame";
import useLobby from "../../hooks/useLobby";
import ChatBox from "./ChatBox";
import GameBoard from "./GameBoard";
import BoardActions from "./BoardActions";
import GameBoardSelection from "./GameBoard/GameBoardSelection";
import GameBoardTiles from "./GameBoard/GameBoardTiles";
import LeaveGame from "./LeaveGame";
import TableDecks from "./BoardPieces/TableDecks";

const Game = ({ lobby }: { lobby: ReturnType<typeof useLobby> }) => {
	const game = useGame(lobby.onDelta, lobby.sendGameAction);
	const chat = useChat(lobby.onChatMessage, lobby.sendChatMessage);

	if (lobby.lobbyStatus.status !== "ingame") {
		return <div>Loading...</div>;
	}

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
				Game: {lobby.lobbyStatus.gameId}
			</div>
			<ChatBox chat={chat} nicknames={game.nicknames} />
			<GameBoard>
				<GameBoardTiles />
				<GameBoardSelection />
				<TableDecks decks={Object.values(game.decks)} />
			</GameBoard>
			<BoardActions game={game} />
			<LeaveGame leaveGame={lobby.leaveGame} />
		</div>
	);
};

export default Game;
