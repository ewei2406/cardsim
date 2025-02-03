import { GameDescription } from "../../util/types/ServerResponse";

const GameCard = ({
	gameDescription,
	onClickJoin,
}: {
	gameDescription: GameDescription;
	onClickJoin: (game_id: number) => void;
}) => {
	const handleClick = () => {
		onClickJoin(gameDescription.game_id);
	};

	return (
		<div className="card row">
			<div>
				Game {gameDescription.game_id} ({gameDescription.player_ct}{" "}
				{gameDescription.player_ct === 1 ? "player" : "players"})
			</div>
			<button onClick={handleClick}>Join</button>
		</div>
	);
};

export default GameCard;
