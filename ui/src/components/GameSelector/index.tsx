import { TbPlus, TbRefresh } from "react-icons/tb";
import GameCard from "./GameCard";
import { GameDescription } from "../../hooks/useClient/ServerResponse";

const GameSelector = (props: {
	availableGames: GameDescription[];
	refreshGames: () => void;
	joinGame: (game_id: number) => void;
	createGame: () => void;
}) => {
	return (
		<div>
			<div
				style={{
					display: "flex",
					gap: 10,
					alignItems: "center",
					marginBottom: 5,
				}}
			>
				<div style={{ fontWeight: 800 }}>Available Games</div>
				<button onClick={props.refreshGames}>
					<TbRefresh />
					Refresh
				</button>
				<button
					style={{
						marginLeft: "auto",
					}}
					onClick={props.createGame}
				>
					<TbPlus />
					Create Game
				</button>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{props.availableGames.map((gameDescription) => (
					<GameCard
						key={gameDescription.game_id}
						gameDescription={gameDescription}
						onClickJoin={() => props.joinGame(gameDescription.game_id)}
					/>
				))}
			</div>
		</div>
	);
};

export default GameSelector;
