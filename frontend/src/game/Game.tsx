import ChatHistory from "@/components/ChatHistory/ChatHistory";
import { SendMessageContext } from "@/context/useSendMessage";
import { updateTransform } from "@/hooks/useTransformCoords";
import { GameState } from "@/util/GameState";
import { SendMessage } from "@/util/types/ClientRequest";
import { useState, useEffect } from "react";
import DragArrow from "./BoardPieces/DragArrow";
import TableCards from "./BoardPieces/TableCards";
import TableDecks from "./BoardPieces/TableDecks";
import GameBoard from "./GameBoard";
import BoardActions from "./GameUI/Actions";
import LeaveGame from "./GameUI/LeaveGame";
import MyHand from "./GameUI/MyHand";
import Void from "./GameUI/Void";

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
		<SendMessageContext.Provider value={{ sendMessage }}>
			<Void />
			<GameBoard gameId={gameId} isOnRight={isOnRight}>
				<DragArrow playerGroup={gameState.playerMap[clientId]} />
				<TableCards gameState={gameState} />
				<TableDecks decks={gameState.decks} />
			</GameBoard>
			<MyHand
				clientId={clientId}
				hands={gameState.hands}
				players={gameState.players}
			/>
			<BoardActions />
			<ChatHistory />
			<LeaveGame />
		</SendMessageContext.Provider>
	);
};

export default Game;
