import { useState, useEffect, useCallback } from "react";
import { useSelection } from "../../../../../hooks/useSelection";
import {
	MY_HAND_CARD_SIZE,
	MY_HAND_CARDS_MAX_ARC,
	MY_HAND_CARDS_SPACING_DEG,
} from "../../../../../util/constants";
import { EntityId, HandGroup } from "../../../../../util/GameState";
import {
	HandCard,
	PlayerDescription,
} from "../../../../../util/types/ServerResponse";
import MyHandActions from "./MyHandActions";
import MyHandCard from "./MyHandCard";
import { CardOrdering } from "../../../../../util/cardOrdering";

const MyHandContent = ({ hand }: { hand: HandGroup }) => {
	const { selection } = useSelection();
	const ids = selection.type === "handCards" ? selection.handCardIds : [];

	const [showHand, setShowHand] = useState(false);

	const [cardsOrder, setCardsOrder] = useState<Map<number, number>>(new Map());
	const [draggingCard, setDraggingCard] = useState<HandCard | null>(null);

	const handleDragOver = useCallback(
		(card: HandCard) => {
			console.log("drag over", card.id);
			if (
				!draggingCard ||
				card.id === draggingCard.id ||
				!cardsOrder.has(card.id) ||
				!cardsOrder.has(draggingCard.id)
			)
				return;
			const newCardsOrder = new Map(cardsOrder);
			const origIdx = cardsOrder.get(draggingCard.id)!;
			const targetIdx = cardsOrder.get(card.id)!;
			newCardsOrder.set(draggingCard.id, targetIdx);
			console.log("drag", origIdx, "=>", targetIdx);
			cardsOrder.forEach((idx, id) => {
				if (origIdx < idx && idx <= targetIdx) {
					newCardsOrder.set(id, idx - 1);
				}
				if (targetIdx <= idx && idx < origIdx) {
					newCardsOrder.set(id, idx + 1);
				}
				console.log("here 2");
			});
			setCardsOrder(newCardsOrder);
		},
		[cardsOrder, draggingCard]
	);

	const handleSort = useCallback(
		(sortFn: CardOrdering) => {
			const newCardsOrder = new Map<number, number>();
			hand.hand.cards.forEach((card) => {
				if (card.type === "AnonHandCard") return;
				newCardsOrder.set(card.id, sortFn(card));
			});
			const asArray = Array.from(newCardsOrder.entries()).sort(
				([, a], [, b]) => a - b
			);
			asArray.forEach(([id], i) => {
				newCardsOrder.set(id, i);
			});
			setCardsOrder(newCardsOrder);
		},
		[hand.hand.cards]
	);

	useEffect(() => {
		// No changes
		if (
			hand.hand.cards.length === cardsOrder.size &&
			hand.hand.cards.every((c) => cardsOrder.has(c.id))
		) {
			return;
		}

		const newCardsOrder = new Map<number, number>();
		// Carry the existing cards over
		hand.hand.cards.forEach((card) => {
			if (cardsOrder.has(card.id)) {
				newCardsOrder.set(card.id, cardsOrder.get(card.id)!);
				return;
			}
		});
		const asArray = Array.from(newCardsOrder.entries()).sort(
			([, a], [, b]) => a - b
		);
		asArray.forEach(([id], i) => {
			newCardsOrder.set(id, i);
		});
		// Add new cards
		hand.hand.cards.forEach((card) => {
			if (newCardsOrder.has(card.id)) return;
			newCardsOrder.set(card.id, newCardsOrder.size);
		});
		console.log(newCardsOrder);
		setCardsOrder(newCardsOrder);
	}, [cardsOrder, hand]);

	const nMax = hand.hand.cards.length;
	const thetaMax = Math.min(
		showHand ? 20 : MY_HAND_CARDS_MAX_ARC,
		nMax * MY_HAND_CARDS_SPACING_DEG
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
				{hand.hand.cards.map((card) => (
					<MyHandCard
						key={card.id}
						handleDragOver={handleDragOver}
						setDraggingCard={setDraggingCard}
						setShowHand={setShowHand}
						draggingCard={draggingCard}
						n={cardsOrder.get(card.id) ?? 0}
						nMax={nMax}
						thetaMax={thetaMax}
						card={card}
						selected={ids.includes(card.id)}
					/>
				))}
			</div>

			<MyHandActions
				setShowHand={setShowHand}
				ids={ids}
				handleSort={handleSort}
			/>
		</div>
	);
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
	const myHand = players.find((p) => p.client_id === clientId)?.hand;
	if (!myHand) {
		return <></>;
	}

	const hand = hands[myHand];
	if (!hand) {
		return <></>;
	}

	return <MyHandContent hand={hand} />;
};

export default MyHand;
