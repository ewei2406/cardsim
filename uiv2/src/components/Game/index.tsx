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
import MyHand from "./BoardPieces/MyHand";
import { updateTransform } from "../../hooks/useTransformCoords";
import getTableCards from "./BoardPieces/TableCard/getTableCards";
import { useSelection } from "../../hooks/useSelection";
import TableCard from "./BoardPieces/TableCard";
import getTableHandCards from "./BoardPieces/TableCard/getTableHandCards";
import getTableDeckCards from "./BoardPieces/TableCard/getTableDeckCards";
import Void from "./GameBoard/Void";

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
	const tableHandCards = getTableHandCards(
		gameState.playerMap,
		gameState.hands
	);
	const tableDeckCards = getTableDeckCards(gameState.decks, selection);
	const cards = [...tableHandCards, ...tableCards, ...tableDeckCards].sort(
		(a, b) => a.id - b.id
	);

	return (
		<div>
			<Void />
			<MyHand
				sendMessage={sendMessage}
				clientId={clientId}
				hands={gameState.hands}
				players={gameState.players}
			/>
			<GameBoard gameId={gameId} isOnRight={isOnRight}>
				<GameBoardTiles sendMessage={sendMessage} />
				<DragArrow playerGroup={gameState.playerMap[clientId]} />
				<GameBoardSelection />
				<TableDecks decks={gameState.decks} />
				{cards.map((cardProps) => (
					<TableCard key={cardProps.id} {...cardProps} />
				))}
			</GameBoard>
			<BoardActions sendMessage={sendMessage} />
			<ChatHistory sendMessage={sendMessage} />
			<LeaveGame sendMessage={sendMessage} />
		</div>
	);
};

export default Game;
