import { HandCard } from "./types/ServerResponse";

const SUIT_ORDER = {
	S: 0,
	H: 1,
	D: 2,
	C: 3,
	J: 4,
};

const RANK_ORDER: Record<number, number> = {
	2: 0,
	3: 1,
	4: 2,
	5: 3,
	6: 4,
	7: 5,
	8: 6,
	9: 7,
	10: 8,
	11: 9,
	12: 10,
	1: 12,
	13: 11,
	14: 13,
	15: 14,
};

export type CardOrdering = (card: HandCard & { type: "HandCard" }) => number;
export const byRank: CardOrdering = (card) => {
	return (RANK_ORDER[card.rank] << 3) + SUIT_ORDER[card.suit];
};
export const bySuit: CardOrdering = (card) => {
	return (SUIT_ORDER[card.suit] << 3) + RANK_ORDER[card.rank];
};
