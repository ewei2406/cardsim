import { GameState } from "../../util/GameState";
import { SendMessage } from "../../util/types/ClientRequest";
import ChatHistory from "../Chat/ChatHistory";
import LeaveGame from "./LeaveGame";
import GameBoard from "./GameBoard";
import GameBoardTiles from "./GameBoard/GameBoardTiles";
import DragArrow from "./BoardPieces/DragArrow";
import GameBoardSelection from "./GameBoard/GameBoardSelection";
import BoardActions from "./BoardActions";
import TableDecks from "./BoardPieces/TableDecks";
import { useEffect, useState } from "react";
import MyHand from "./BoardPieces/MyHand";
import { updateTransform } from "../../hooks/useTransformCoords";
import Void from "./GameBoard/Void";
import TableCards from "./BoardPieces/TableCards";

interface GameProps {
	gameState: GameState;
	gameId: number;
	sendMessage: SendMessage;
	clientId: number;
}

const Game = ({ gameState, gameId, sendMessage, clientId }: GameProps) => {
	const [isOnRight, setPlayerIsOnRight] = useState(false);

	useEffect(() => {
		if (!gameState.playerMap[clientId]) return;
		updateTransform(gameState.playerMap[clientId].rot);
		setPlayerIsOnRight(gameState.playerMap[clientId].order > 3);
	}, [clientId, gameState.playerMap, gameState.players]);

	return (
		<div>
			<Void />
			<GameBoard gameId={gameId} isOnRight={isOnRight}>
				<GameBoardTiles sendMessage={sendMessage} />
				<GameBoardSelection />
				<DragArrow playerGroup={gameState.playerMap[clientId]} />
				<TableCards gameState={gameState} />
				<TableDecks decks={gameState.decks} />
			</GameBoard>
			<MyHand
				sendMessage={sendMessage}
				clientId={clientId}
				hands={gameState.hands}
				players={gameState.players}
			/>
			<BoardActions sendMessage={sendMessage} />
			<ChatHistory sendMessage={sendMessage} />
			<LeaveGame sendMessage={sendMessage} />
		</div>
	);
};

export default Game;
