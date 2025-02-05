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
import { useDrag } from "../../../../../hooks/useDrag";

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
	const { hoverDrag, startDrag, finishDrag } = useDrag();

	const [hover, setHover] = useState(false);

	if (card.type === "Hidden") {
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

	if (card.type === "Visible") {
		return (
			<div
				onMouseEnter={(e) => {
					setHover(true);
					setShowHand(true);
					if (e.buttons === 1) {
						hoverDrag({ type: "myHand" });
					}
					e.stopPropagation();
				}}
				onMouseLeave={(e) => {
					setHover(false);
					setShowHand(false);
					e.stopPropagation();
				}}
				onMouseDown={(e) => {
					if (e.buttons === 1) {
						startDrag({ type: "myHandCard", cardId: card.id });
					}
					setDraggingCard(card);
					e.stopPropagation();
				}}
				onMouseUp={(e) => {
					setDraggingCard(null);
					finishDrag({ type: "myHand" });
					e.stopPropagation();
				}}
				onMouseOver={(e) => {
					if (!beingDragged) {
						handleDragOver(card);
					}
					if (e.buttons !== 1) {
						setDraggingCard(null);
					}
					e.stopPropagation();
				}}
				onClick={(e) => {
					addSelection({
						type: "handCard",
						handCardId: card.id,
					});
					e.stopPropagation();
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
