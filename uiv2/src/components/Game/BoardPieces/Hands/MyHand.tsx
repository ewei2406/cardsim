import { useState } from "react";
import { useSelection } from "../../../../hooks/useSelection";
import {
	MY_HAND_CARDS_MAX_ARC,
	MY_HAND_CARDS_SPACING_DEG,
	MY_HAND_CARDS_SPACING_DIST,
	MY_HAND_CARD_SIZE,
} from "../../../../util/constants";
import { EntityId, HandGroup } from "../../../../util/GameState";
import {
	HandCard,
	PlayerDescription,
} from "../../../../util/types/ServerResponse";
import CardBack from "../../../Card/CardBack";
import CardFront from "../../../Card/CardFront";

const MyHandCard = ({
	card,
	r,
	theta,
	selected,
}: {
	card: HandCard;
	r: number;
	theta: number;
	selected?: boolean;
}) => {
	if (card.type === "AnonHandCard") {
		return (
			<CardBack
				deck_id={card.deck_id}
				width={MY_HAND_CARD_SIZE}
				selected={selected}
			/>
		);
	}

	if (card.type === "HandCard") {
		return (
			<div
				style={{
					position: "absolute",
					bottom: 0,
					left: "50%",
					transformOrigin: `${MY_HAND_CARD_SIZE / 2}px ${r}px`,
					transform: `translate(-50%, -50%) rotateZ(${theta}deg)`,
				}}
			>
				<CardFront
					deck_id={card.deck_id}
					fontSize={MY_HAND_CARD_SIZE / 6}
					width={MY_HAND_CARD_SIZE}
					rank={card.rank}
					suit={card.suit}
					selected={selected}
				/>
			</div>
		);
	}
};

const MyHand = ({
	hands,
	players,
	clientId,
}: {
	clientId: number;
	players: PlayerDescription[];
	hands: { [id: EntityId]: HandGroup };
}) => {
	const { selection } = useSelection();
	const [hover, setHover] = useState(false);

	const myHand = players.find((p) => p.client_id === clientId)?.hand;
	if (!myHand) {
		return <></>;
	}

	const hand = hands[myHand];
	if (!hand) {
		return <></>;
	}

	const ids =
		selection.type === "cards" ? selection.cards.map((c) => c.id) : [];

	const n = hand.hand.cards.length;
	const max = Math.min(
		hover ? 20 : MY_HAND_CARDS_MAX_ARC,
		n * MY_HAND_CARDS_SPACING_DEG
	);

	return (
		<div
			onMouseOver={() => {
				setHover(true);
			}}
			onMouseLeave={() => {
				setHover(false);
			}}
			style={{
				height: MY_HAND_CARD_SIZE * 1.7,
				zIndex: 1001,
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				transition: "transform 0.2s ease",
				transform: `translateY(${hover ? 0 : MY_HAND_CARD_SIZE * 1.25}px)`,
			}}
		>
			<div
				className="center-content"
				style={{
					position: "relative",
					transform: `translateY(${MY_HAND_CARD_SIZE * 2.25}px)`,
				}}
			>
				{hand.hand.cards.map((card, index) => (
					<MyHandCard
						r={MY_HAND_CARDS_SPACING_DIST}
						theta={((index + 0.5) / n - 0.5) * max}
						key={card.id}
						card={card}
						selected={ids.includes(card.id)}
					/>
				))}
			</div>
		</div>
	);
};

export default MyHand;
