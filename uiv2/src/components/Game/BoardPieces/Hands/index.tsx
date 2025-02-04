import { COLORS, hashColor } from "../../../../util/colors";
import {
	OTHER_HAND_CARD_SIZE,
	OTHER_HAND_CARDS_MAX_ARC,
	OTHER_HAND_CARDS_SPACING_DEG,
	OTHER_HAND_CARDS_SPACING_DIST,
} from "../../../../util/constants";
import { EntityId, HandGroup, PlayerGroup } from "../../../../util/GameState";
import CardBack from "../../../Card/CardBack";
import BoardPiece from "../BoardPiece";

const TableHand = ({
	hand,
	x,
	y,
	player,
	isMe,
}: {
	isMe: boolean;
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
					position: "absolute",
					top: 0,
					left: 0,
					transform: `translateY(${OTHER_HAND_CARD_SIZE * 1.4}px)`,
				}}
			>
				{hand.hand.cards.map((card, index) => (
					<div
						key={card.id}
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
				{player.nickname} {isMe && "(me)"}
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
				{player.nickname} {isMe && "(me)"}
			</div>
		</BoardPiece>
	);
};

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
					hands[player.hand] && (
						<TableHand
							key={player.client_id}
							hand={hands[player.hand]}
							player={player}
							isMe={player.client_id === clientId}
							x={player.x}
							y={player.y}
						/>
					)
			)}
		</>
	);
};

export default TableHands;
