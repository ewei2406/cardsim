import { dragObject } from "../../../../hooks/useDrag";
import {
	OTHER_HAND_CARD_SIZE,
	OTHER_HAND_CARDS_MAX_ARC,
	OTHER_HAND_CARDS_SPACING_DEG,
	OTHER_HAND_CARDS_SPACING_DIST,
} from "../../../../util/constants";
import { EntityId, HandGroup, PlayerGroup } from "../../../../util/GameState";
import { TableCardProps } from "./TableCard";

const getTableHand = (
	hand: HandGroup,
	player: PlayerGroup
): TableCardProps[] => {
	const { finishDrag, hoverDrag } = dragObject;
	const n = hand.hand.cards.length;
	const max = Math.min(
		OTHER_HAND_CARDS_MAX_ARC,
		n * OTHER_HAND_CARDS_SPACING_DEG
	);

	return hand.hand.cards.map((card, index) => ({
		id: card.id,
		x: player.x,
		y: player.y,
		rot: ((index + 0.5) / n - 0.5) * max,
		tableCard: {
			deck_id: card.deck_id,
			type: "Hidden",
		},
		style: {
			zIndex: index,
			transformOrigin: `${
				OTHER_HAND_CARD_SIZE / 2
			}px ${OTHER_HAND_CARDS_SPACING_DIST}px`,
		},
		onMouseEnter: (e) => {
			if (e.buttons === 1) {
				hoverDrag({ type: "myHand" });
			}
			e.stopPropagation();
		},
		onMouseOver: (e) => {
			if (e.buttons === 1) {
				hoverDrag({ type: "myHand" });
			}
			e.stopPropagation();
		},
		onMouseUp: (e) => {
			finishDrag({ type: "myHand" });
			e.stopPropagation();
		},
	}));
};

// TODO: move this elsewhere
{
	/* <BoardPiece x={player.x} y={player.y} disableInteraction>
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
</BoardPiece>; */
}

const getTableHandCards = (
	playerMap: { [clientId: number]: PlayerGroup },
	hands: { [id: EntityId]: HandGroup }
): TableCardProps[] => {
	const arr: TableCardProps[] = [];
	Object.values(playerMap).forEach((player) => {
		if (!hands[player.hand]) return;
		arr.push(...getTableHand(hands[player.hand], player));
	});
	return arr;
};

export default getTableHandCards;
