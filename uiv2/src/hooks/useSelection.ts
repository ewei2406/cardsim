import { useSyncExternalStore } from "react";
import { DeckGroup, CardGroup, HandGroup } from "../util/GameState";

export type GameSelection =
	| {
			type: "none";
	  }
	| {
			type: "gameBoard";
			x: number;
			y: number;
	  }
	| {
			type: "deck";
			deck: DeckGroup;
	  }
	| {
			type: "cards";
			cards: CardGroup[];
	  }
	| {
			type: "handCards";
			hand: HandGroup;
			handCardIds: number[];
	  };

export type AddSelection =
	| {
			type: "none";
	  }
	| {
			type: "gameBoard";
			x: number;
			y: number;
	  }
	| {
			type: "deck";
			deck: DeckGroup;
	  }
	| {
			type: "card";
			card: CardGroup;
	  }
	| {
			type: "handCard";
			hand: HandGroup;
			handCardId: number;
	  };

class SelectionStore {
	selection: GameSelection = { type: "none" };
	listeners = new Set<() => void>();

	constructor() {}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	notify = () => {
		this.listeners.forEach((listener) => listener());
	};

	getSelection = () => {
		return this.selection;
	};

	setSelection(selection: GameSelection) {
		this.selection = selection;
		this.notify();
	}

	addSelection(addSelection: AddSelection) {
		let cards: CardGroup[] = [];
		switch (addSelection.type) {
			case "none":
				this.setSelection({ type: "none" });
				break;
			case "gameBoard":
				this.setSelection({
					type: "gameBoard",
					x: addSelection.x,
					y: addSelection.y,
				});
				break;
			case "deck":
				this.setSelection({
					type: "deck",
					deck: addSelection.deck,
				});
				break;
			case "card":
				if (this.selection.type === "cards") {
					if (
						this.selection.cards.find(
							(card) => card.id === addSelection.card.id
						)
					) {
						cards = this.selection.cards.filter(
							(card) => card.id !== addSelection.card.id
						);
						if (cards.length === 0) {
							this.setSelection({ type: "none" });
						} else {
							this.setSelection({
								type: "cards",
								cards,
							});
						}
						break;
					}
					this.setSelection({
						type: "cards",
						cards: [...this.selection.cards, addSelection.card],
					});
				} else {
					this.setSelection({
						type: "cards",
						cards: [addSelection.card],
					});
				}
				break;
			case "handCard":
				if (this.selection.type === "handCards") {
					this.setSelection({
						type: "handCards",
						hand: addSelection.hand,
						handCardIds: [
							...this.selection.handCardIds,
							addSelection.handCardId,
						],
					});
				} else {
					this.setSelection({
						type: "handCards",
						hand: addSelection.hand,
						handCardIds: [addSelection.handCardId],
					});
				}
				break;
			default:
				break;
		}
	}
}

export const selectionStore = new SelectionStore();

export const useSelection = () => {
	const selection = useSyncExternalStore(
		selectionStore.subscribe,
		selectionStore.getSelection
	);

	const { setSelection, deselect } = useSelect();

	return { selection, setSelection, deselect };
};

export const useSelect = () => {
	const setSelection = (selection: GameSelection) => {
		selectionStore.setSelection(selection);
	};

	const addSelection = (addSelection: AddSelection) => {
		selectionStore.addSelection(addSelection);
	};

	const deselect = () => {
		selectionStore.setSelection({ type: "none" });
	};

	return { addSelection, setSelection, deselect };
};
