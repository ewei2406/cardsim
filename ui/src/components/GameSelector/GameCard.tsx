import { TbDoorEnter } from "react-icons/tb";
import { GameDescription } from "../../hooks/useLobby";

const GameCard = (props: {
	gameDescription: GameDescription;
	onClickJoin: (game_id: number) => void;
}) => {
	const handleClick = () => {
		props.onClickJoin(props.gameDescription.game_id);
	};

	return (
		<div className="card">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div>
					Game {props.gameDescription.game_id} (
					{props.gameDescription.player_ids.length}{" "}
					{props.gameDescription.player_ids.length === 1 ? "player" : "players"}
					)
				</div>
				<div>
					<button onClick={handleClick}>
						<TbDoorEnter />
						Join
					</button>
				</div>
			</div>
		</div>
	);
};

export default GameCard;
