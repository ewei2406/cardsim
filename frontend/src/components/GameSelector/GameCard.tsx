import { MAX_PLAYER_COUNT } from "@/util/constants";
import { GameDescription } from "@/util/types/ServerResponse";

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

	const full = gameDescription.player_ct >= MAX_PLAYER_COUNT;

	return (
		<div className="card row">
			<div>
				Game {gameDescription.game_id} ({gameDescription.player_ct}/
				{MAX_PLAYER_COUNT} players)
			</div>
			<button onClick={handleClick} disabled={full}>
				{full ? "Full" : "Join"}
			</button>
		</div>
	);
};

export default GameCard;
