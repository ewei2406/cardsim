import GameCard from "./GameCard";
import { GameDescription } from "../../util/types/ServerResponse";
import { SendMessage } from "../../util/types/ClientRequest";
import { useCallback, useState } from "react";
import { TbPlus, TbRefresh } from "react-icons/tb";

const GameSelector = ({
	availableGames,
	sendMessage,
}: {
	availableGames: GameDescription[];
	sendMessage: SendMessage
}) => {
	const [nickname, setNickname] = useState("");

	const refreshGames = useCallback(() => {
		sendMessage({ type: "Command", command: "ListGames" });
	}, [sendMessage]);

	const createGame = () => {
		sendMessage({
			type: "Command",
			command: "CreateGame",
			nickname: nickname || "Player",
		});
	};

	const joinGame = (gameId: number) => {
		sendMessage({
			type: "Command",
			command: "JoinGame",
			game_id: gameId,
			nickname: nickname || "Player",
		});
	};

	return (
		<div
			className="column"
			style={{ maxWidth: 800, margin: "0 auto", padding: 100 }}
		>
			<div className="row">
				Set Nickname
				<input
					type="text"
					value={nickname}
					placeholder="Player"
					onChange={(e) => setNickname(e.target.value)}
				/>
			</div>
			<div className="row">
				<div className="row">
					<h3>Available Games</h3>
					<button onClick={refreshGames}>
						<TbRefresh />
						Refresh
					</button>
				</div>
				<button onClick={createGame}>
					<TbPlus />
					Create Game
				</button>
			</div>
			<div>
				{availableGames.map((gameDescription) => (
					<GameCard
						key={gameDescription.game_id}
						gameDescription={gameDescription}
						onClickJoin={() => joinGame(gameDescription.game_id)}
					/>
				))}
			</div>
		</div>
	);
};

export default GameSelector;
