import { useState, useCallback, useEffect } from "react";
import { CardOrdering } from "../util/cardOrdering";
import { HandCard } from "../util/types/ServerResponse";

export const useMyHand = () => {
	const [handCards, setHandCards] = useState<HandCard[]>([]);
	const [cardsOrder, setCardsOrder] = useState<Map<number, number>>(new Map());
	const [draggingCard, setDraggingCard] = useState<HandCard | null>(null);

	const handleDragOver = useCallback(
		(card: HandCard) => {
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
			cardsOrder.forEach((idx, id) => {
				if (origIdx < idx && idx <= targetIdx) {
					newCardsOrder.set(id, idx - 1);
				}
				if (targetIdx <= idx && idx < origIdx) {
					newCardsOrder.set(id, idx + 1);
				}
			});
			setCardsOrder(newCardsOrder);
		},
		[cardsOrder, draggingCard]
	);

	const handleSort = useCallback(
		(sortFn: CardOrdering) => {
			const newCardsOrder = new Map<number, number>();
			handCards.forEach((card) => {
				if (card.type === "Hidden") return;
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
		[handCards]
	);

	useEffect(() => {
		// No changes
		if (
			handCards.length === cardsOrder.size &&
			handCards.every((c) => cardsOrder.has(c.id))
		) {
			return;
		}

		const newCardsOrder = new Map<number, number>();
		// Carry the existing cards over
		handCards.forEach((card) => {
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
		handCards.forEach((card) => {
			if (newCardsOrder.has(card.id)) return;
			newCardsOrder.set(card.id, newCardsOrder.size);
		});
		setCardsOrder(newCardsOrder);
	}, [cardsOrder, handCards]);

	return {
		setHandCards,
		cardsOrder,
		draggingCard,
		setDraggingCard,
		handleDragOver,
		handleSort,
	};
};

export default useMyHand;
