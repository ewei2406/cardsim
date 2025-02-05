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
import { useEffect, useState } from "react";
import TableHands from "./BoardPieces/Hands";
import MyHand from "./BoardPieces/Hands/MyHand";
import { updateTransform } from "../../hooks/useTransformCoords";
import getTableCards from "./BoardPieces/TableCard/getTableCards";
import { useSelection } from "../../hooks/useSelection";
import TableCard from "./BoardPieces/TableCard";

interface GameProps {
	gameState: GameState;
	gameId: number;
	sendMessage: SendMessage;
	clientId: number;
}

const Game = ({ gameState, gameId, sendMessage, clientId }: GameProps) => {
	const [isOnRight, setPlayerIsOnRight] = useState(false);
	const { selection } = useSelection();

	useEffect(() => {
		if (!gameState.playerMap[clientId]) return;
		updateTransform(gameState.playerMap[clientId].rot);
		setPlayerIsOnRight(gameState.playerMap[clientId].order > 3);
	}, [clientId, gameState.playerMap, gameState.players]);

	// TODO: memoize this. this is pretty bad!
	const tableCards = getTableCards(gameState.cards, selection);

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
				{tableCards.map((cardProps) => (
					<TableCard key={cardProps.id} {...cardProps} />
				))}
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
