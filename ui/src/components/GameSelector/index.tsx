import { TbPlus, TbRefresh } from "react-icons/tb";
import { GameDescription } from "../../hooks/useLobby";
import GameCard from "./GameCard";

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
				<button
					onClick={props.refreshGames}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
					}}
				>
					<TbRefresh style={{ display: "block" }} />
					Refresh
				</button>
				<button
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						marginLeft: "auto",
					}}
					onClick={props.createGame}
				>
					<TbPlus style={{ display: "block" }} />
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
