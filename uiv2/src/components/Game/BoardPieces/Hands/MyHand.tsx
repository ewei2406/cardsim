import { useMemo, useState } from "react";
import { useSelect, useSelection } from "../../../../hooks/useSelection";
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
import { COLORS } from "../../../../util/colors";
import MyHandActions from "./MyHandActions";
import { CardOrdering, byRank } from "../../../../util/cardOrdering";

const MyHandCard = ({
	card,
	r,
	theta,
	setShowHand,
	selected,
}: {
	card: HandCard;
	r: number;
	theta: number;
	setShowHand: (hover: boolean) => void;
	selected?: boolean;
}) => {
	const { addSelection } = useSelect();
	const [hover, setHover] = useState(false);

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
				onMouseEnter={() => {
					setHover(true);
					setShowHand(true);
				}}
				onMouseLeave={() => {
					setHover(false);
					setShowHand(false);
				}}
				onClick={() => {
					addSelection({
						type: "handCard",
						handCardId: card.id,
					});
				}}
				style={{
					position: "absolute",
					bottom: 0,
					left: "50%",
					transformOrigin: `${MY_HAND_CARD_SIZE / 2}px ${r}px`,
					transition: "transform 0.1s ease",
					transform: `translate(-50%, -50%) translateY(${
						hover ? -20 : selected ? -10 : 0
					}px) rotateZ(${theta}deg)`,
				}}
			>
				<CardFront
					deck_id={card.deck_id}
					fontSize={MY_HAND_CARD_SIZE / 6}
					width={MY_HAND_CARD_SIZE}
					rank={card.rank}
					suit={card.suit}
					style={{
						border: `1px solid ${selected ? COLORS.SELECTION : COLORS.LIGHTER}`,
						backgroundColor: selected
							? COLORS.SELECTION_LIGHTER
							: COLORS.LIGHTEST,
					}}
				/>
			</div>
		);
	}
};

const MyHandContent = ({}) => {
	
}

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
	const [showHand, setShowHand] = useState(false);

	const [calcPriority, setCalcPriority] = useState<CardOrdering>(() => byRank);

	const myHand = players.find((p) => p.client_id === clientId)?.hand;
	if (!myHand) {
		return <></>;
	}

	const hand = hands[myHand];
	if (!hand) {
		return <></>;
	}

	const ids = selection.type === "handCards" ? selection.handCardIds : [];
	const n = hand.hand.cards.length;
	const max = Math.min(
		showHand ? 20 : MY_HAND_CARDS_MAX_ARC,
		n * MY_HAND_CARDS_SPACING_DEG
	);

	console.log("calc", calcPriority);

	const cards = useMemo(
		() =>
			[...hand.hand.cards].sort((a, b) => {
				if (a.type !== "HandCard") return 1;
				if (b.type !== "HandCard") return -1;
				return calcPriority(a) - calcPriority(b);
			}),
		[calcPriority, hand.hand.cards]
	);

	return (
		<div
			style={{
				height: MY_HAND_CARD_SIZE * 1.7,
				zIndex: 1001,
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				transition: "transform 0.2s ease",
				transform: `translateY(${showHand ? 0 : MY_HAND_CARD_SIZE}px)`,
			}}
		>
			<div
				className="column"
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: 150,
					display: "flex",
					gap: 5,
					border: `1px solid green`,
				}}
				onMouseOver={() => {
					setShowHand(true);
				}}
				onMouseLeave={() => {
					setShowHand(false);
				}}
			></div>

			<div
				className="center-content"
				style={{
					position: "relative",
					transform: `translateY(${MY_HAND_CARD_SIZE * 2.25}px)`,
				}}
			>
				{cards.map((card, index) => (
					<MyHandCard
						setShowHand={setShowHand}
						r={MY_HAND_CARDS_SPACING_DIST}
						theta={((index + 0.5) / n - 0.5) * max}
						key={card.id}
						card={card}
						selected={ids.includes(card.id)}
					/>
				))}
			</div>

			<MyHandActions
				setShowHand={setShowHand}
				ids={ids}
				setCalcPriority={setCalcPriority}
			/>
		</div>
	);
};

export default MyHand;
