import ChatHistory from "@/components/ChatHistory/ChatHistory";
import { SendMessageContext } from "@/context/useSendMessage";
import DragArrow from "@/game/BoardPieces/DragArrow";
import TableCards from "@/game/BoardPieces/TableCards";
import TableDecks from "@/game/BoardPieces/TableDecks";
import GameBoard from "@/game/GameBoard";
import BoardActions from "@/game/GameUI/Actions";
import LeaveGame from "@/game/GameUI/LeaveGame";
import MyHand from "@/game/GameUI/MyHand";
import Void from "@/game/GameUI/Void";
import { updateTransform } from "@/hooks/useTransformCoords";
import { GameState } from "@/util/GameState";
import { SendMessage } from "@/util/types/ClientRequest";
import { useState, useEffect } from "react";

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
