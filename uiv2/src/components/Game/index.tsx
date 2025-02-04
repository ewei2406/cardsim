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
import TableCards from "./BoardPieces/TableCards";
import { useMemo } from "react";
import TableHands from "./BoardPieces/Hands";
import MyHand from "./BoardPieces/Hands/MyHand";

interface GameProps {
	gameState: GameState;
	gameId: number;
	sendMessage: SendMessage;
	clientId: number;
}

const Game = ({ gameState, gameId, sendMessage, clientId }: GameProps) => {
	const myHand = useMemo(() => {
		const myDesc = gameState.players.find((p) => p.client_id === clientId);
		console.log(myDesc);
		if (!myDesc || !gameState.hands[myDesc.hand]) {
			return null;
		}
		return gameState.hands[myDesc.hand];
	}, [clientId, gameState]);

	console.log(myHand);

	return (
		<div>
			<GameBoard gameId={gameId}>
				<GameBoardTiles />
				<DragArrow />
				<GameBoardSelection />
				<TableDecks decks={gameState.decks} />
				<TableCards cards={gameState.cards} />
				<TableHands
					hands={gameState.hands}
					playerMap={gameState.playerMap}
					clientId={clientId}
				/>
			</GameBoard>
			<MyHand
				hands={gameState.hands}
				players={gameState.players}
				clientId={clientId}
			/>
			<BoardActions sendMessage={sendMessage} />
			<ChatHistory sendMessage={sendMessage} />
			<LeaveGame sendMessage={sendMessage} />
		</div>
	);
};

export default Game;
