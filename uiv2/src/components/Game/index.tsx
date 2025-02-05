import { GameState } from "../../util/GameState";
import { SendMessage } from "../../util/types/ClientRequest";
import ChatHistory from "../Chat/ChatHistory";
import LeaveGame from "./LeaveGame";
import GameBoard from "./GameBoard";
import GameBoardTiles from "./GameBoard/GameBoardTiles";
import DragArrow from "./GameBoard/DragArrow";
import GameBoardSelection from "./GameBoard/GameBoardSelection";
import BoardActions from "./BoardActions";
import TableDecks from "./BoardPieces/TableDecks";
import TableCards from "./BoardPieces/TableCard/TableCards";
import { useEffect, useState } from "react";
import TableHands from "./BoardPieces/Hands";
import MyHand from "./BoardPieces/Hands/MyHand";
import { updateTransform } from "../../hooks/useTransformCoords";

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

	console.log(gameState);

	return (
		<div>
			<MyHand
				sendMessage={sendMessage}
				clientId={clientId}
				hands={gameState.hands}
				players={gameState.players}
			/>
			<GameBoard gameId={gameId} isOnRight={isOnRight}>
				<GameBoardTiles />
				<DragArrow playerGroup={gameState.playerMap[clientId]} />
				<GameBoardSelection />
				<TableDecks decks={gameState.decks} />
				<TableCards cards={gameState.cards} />
				<TableHands
					hands={gameState.hands}
					playerMap={gameState.playerMap}
					clientId={clientId}
				/>
			</GameBoard>
			<BoardActions sendMessage={sendMessage} />
			<ChatHistory sendMessage={sendMessage} />
			<LeaveGame sendMessage={sendMessage} />
		</div>
	);
};

export default Game;
