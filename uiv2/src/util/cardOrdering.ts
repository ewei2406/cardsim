import { HandCard } from "./types/ServerResponse";

const SUIT_ORDER = {
	S: 0,
	H: 1,
	D: 2,
	C: 3,
	J: 4,
};

export type CardOrdering = (card: HandCard & { type: "HandCard" }) => number;
export const byRank: CardOrdering = (card) => {
	return card.rank * 100 + SUIT_ORDER[card.suit];
};
export const bySuit: CardOrdering = (card) => {
	return SUIT_ORDER[card.suit] * 100 + card.rank;
}