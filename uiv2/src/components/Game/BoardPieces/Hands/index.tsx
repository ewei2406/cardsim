import { COLORS, hashColor } from "../../../../util/colors";
import {
	OTHER_HAND_CARD_SIZE,
	OTHER_HAND_CARDS_MAX_ARC,
	OTHER_HAND_CARDS_SPACING_DEG,
	OTHER_HAND_CARDS_SPACING_DIST,
} from "../../../../util/constants";
import { EntityId, HandGroup, PlayerGroup } from "../../../../util/GameState";
import {
	HandCard,
	PlayerDescription,
} from "../../../../util/types/ServerResponse";
import CardBack from "../../../Card/CardBack";
import BoardPiece from "../BoardPiece";

const TableHand = ({
	hand,
	x,
	y,
	player,
}: {
	hand: HandGroup;
	x: number;
	y: number;
	player: PlayerGroup;
}) => {
	const n = hand.hand.cards.length;
	const max = Math.min(
		OTHER_HAND_CARDS_MAX_ARC,
		n * OTHER_HAND_CARDS_SPACING_DEG
	);

	return (
		<BoardPiece x={x} y={y}>
			<div
				style={{
					transform: `rotateZ(${player.rot}deg)`,
				}}
			>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						transform: `translateY(${OTHER_HAND_CARD_SIZE * 1.4}px)`,
					}}
				>
					{hand.hand.cards.map((card, index) => (
						<div
							style={{
								position: "absolute",
								bottom: 0,
								left: "50%",
								transformOrigin: `${
									OTHER_HAND_CARD_SIZE / 2
								}px ${OTHER_HAND_CARDS_SPACING_DIST}px`,
								transform: `translate(-50%, -50%) rotateZ(${
									((index + 0.5) / n - 0.5) * max
								}deg)`,
							}}
						>
							<CardBack
								deck_id={card.deck_id}
								width={OTHER_HAND_CARD_SIZE}
								key={card.id}
							/>
						</div>
					))}
				</div>
			</div>

			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					color: hashColor(player.client_id),
					transform: `translate(-50%, -10px) translateZ(4px)`,
					WebkitTextStroke: `5px ${COLORS.LIGHTEST}`,
				}}
			>
				{player.nickname}
			</div>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					transform: `translate(-50%, -10px) translateZ(4px)`,
					color: hashColor(player.client_id),
				}}
			>
				{player.nickname}
			</div>
		</BoardPiece>
	);
};

const testHands: { [id: number]: HandGroup } = {};
const testPlayers: PlayerDescription[] = [];

for (let i = 0; i < 8; i++) {
	testHands[i] = {
		id: i + 100,
		hand: {
			cards: Array.from({ length: 30 }).map(
				(_, j): HandCard => ({
					type: "AnonHandCard",
					deck_id: i + 200,
					id: i + j + 200,
				})
			),
			client_id: i,
		},
	};
	testPlayers.push({
		client_id: i,
		hand: i + 100,
		nickname: "Player " + i,
	});
}

const TableHands = ({
	hands,
	playerMap,
	clientId,
}: {
	clientId: number;
	playerMap: { [clientId: number]: PlayerGroup };
	hands: { [id: EntityId]: HandGroup };
}) => {
	return (
		<>
			{Object.values(playerMap).map(
				(player) =>
					// player.client_id !== clientId &&
					hands[player.hand] && (
						<TableHand
							key={player.client_id}
							hand={hands[player.hand]}
							player={player}
							x={player.x}
							y={player.y}
						/>
					)
			)}
		</>
	);
};

export default TableHands;
