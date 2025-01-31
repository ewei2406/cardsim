import { TbRefresh } from "react-icons/tb";
import { GameDescription } from "../../hooks/useLobby";
import GameCard from "./GameCard";

const GameSelector = (props: {
	availableGames: GameDescription[];
	refreshGames: () => void;
}) => {
	return (
		<div>
			<div
				style={{
					display: "flex",
					gap: 10,
					alignItems: "center",
				}}
			>
				<div style={{ fontWeight: 800 }}>Available Games</div>
				<button onClick={props.refreshGames}>
					<TbRefresh
						style={{ color: "var(--lightest-color)", display: "block" }}
					/>
				</button>
			</div>
			<div
				style={{ display: "flex", flexDirection: "column", gap: 5, padding: 5 }}
			>
				{props.availableGames.map((gameDescription) => (
					<GameCard
						key={gameDescription.game_id}
						gameDescription={gameDescription}
						onClickJoin={() => {}}
					/>
				))}
			</div>
		</div>
	);
};

export default GameSelector;
