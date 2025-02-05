import { useState } from "react";
import { useSelect } from "../../../../../hooks/useSelection";
import {
	MY_HAND_CARD_SIZE,
	MY_HAND_CARDS_SPACING_DIST,
} from "../../../../../util/constants";
import { HandCard } from "../../../../../util/types/ServerResponse";
import CardBack from "../../../../Card/CardBack";
import CardFront from "../../../../Card/CardFront";
import { COLORS } from "../../../../../util/colors";

const MyHandCard = ({
	card,
	n,
	nMax,
	thetaMax,
	draggingCard,
	setShowHand,
	handleDragOver,
	setDraggingCard,
	selected,
}: {
	card: HandCard;
	n: number;
	nMax: number;
	thetaMax: number;
	draggingCard: HandCard | null;
	setShowHand: (hover: boolean) => void;
	handleDragOver: (card: HandCard) => void;
	setDraggingCard: (card: HandCard | null) => void;
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

	const beingDragged = draggingCard && draggingCard.id === card.id;
	const otherCardBeingDragged = draggingCard && draggingCard.id !== card.id;
	const shouldHover = hover && !beingDragged && !otherCardBeingDragged;

	const dist = beingDragged
		? -20
		: selected
		? -5
		: otherCardBeingDragged
		? 0
		: shouldHover
		? -10
		: 0;

	const theta = ((n + 0.5) / nMax - 0.5) * thetaMax;

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
				onMouseDown={(e) => {
					setDraggingCard(card);
					e.stopPropagation();
				}}
				onMouseUp={(e) => {
					setDraggingCard(null);
					e.stopPropagation();
				}}
				onMouseOver={(e) => {
					if (e.buttons === 1 && !beingDragged) {
						e.preventDefault();
						handleDragOver(card);
					}
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
					transformOrigin: `${
						MY_HAND_CARD_SIZE / 2
					}px ${MY_HAND_CARDS_SPACING_DIST}px`,
					transform: `translate(-50%, -50%) translateY(${dist}px) rotateZ(${theta}deg)`,
					transition: "transform 0.1s ease",
					zIndex: n,
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

export default MyHandCard;
