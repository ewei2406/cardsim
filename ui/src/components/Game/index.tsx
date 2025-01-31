import { useChat } from "../../hooks/useChat";
import useGame from "../../hooks/useGame";
import useLobby from "../../hooks/useLobby";
import ChatBox from "./ChatBox";
import LeaveGame from "./LeaveGame";

const Game = ({ lobby }: { lobby: ReturnType<typeof useLobby> }) => {
	const { nicknames } = useGame(lobby.onDelta);
	const chat = useChat(lobby.onChatMessage, lobby.sendChatMessage);
	console.log(nicknames);
	if (lobby.lobbyStatus.status !== "ingame") {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>Game: {lobby.lobbyStatus.gameId}</h1>
			<LeaveGame leaveGame={lobby.leaveGame} />

			<ChatBox chat={chat} nicknames={nicknames} />
		</div>
	);
};

export default Game;
