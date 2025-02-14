import { BOARD_WIDTH } from "@/util/constants";
import { DeckGroup, CardGroup, GameState } from "@/util/GameState";
import { useCallback, useSyncExternalStore } from "react";

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
			handCardId: number;
	  };

class SelectionStore {
	gameState: GameState | null = null;
	selection: GameSelection = { type: "none" };
	listeners = new Set<() => void>();
	onChange: (start: GameSelection, end: GameSelection) => void = () => {};

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

	setSelection = (newSelection: GameSelection) => {
		this.onChange(this.selection, newSelection);
		if (
			(newSelection.type === "cards" && newSelection.cards.length === 0) ||
			(newSelection.type === "handCards" &&
				newSelection.handCardIds.length === 0)
		) {
			newSelection = { type: "none" };
		}
		this.selection = newSelection;
		this.notify();
	};

	refresh = () => {
		this.selection = { ...this.selection };
		this.notify();
	};

	removeEntities = (entityIds: number[]) => {
		const entityIdSet = new Set(entityIds);
		switch (this.selection.type) {
			case "cards":
				if (this.selection.cards.every((card) => !entityIdSet.has(card.id)))
					return;
				this.setSelection({
					type: "cards",
					cards: this.selection.cards.filter(
						(card) => !entityIdSet.has(card.id)
					),
				});
				break;
			case "deck":
				if (!entityIdSet.has(this.selection.deck.id)) return;
				this.setSelection({ type: "none" });
				break;
			case "handCards":
				if (this.selection.handCardIds.every((id) => !entityIdSet.has(id)))
					return;
				this.setSelection({
					type: "handCards",
					handCardIds: this.selection.handCardIds.filter(
						(id) => !entityIdSet.has(id)
					),
				});
				break;
			default:
				break;
		}
	};

	addSelection = (addSelection: AddSelection) => {
		let cards: CardGroup[] = [];
		switch (addSelection.type) {
			case "none":
				this.setSelection({ type: "none" });
				break;
			case "gameBoard":
				if (
					this.selection.type === "gameBoard" &&
					this.selection.x === addSelection.x &&
					this.selection.y === addSelection.y
				) {
					this.setSelection({ type: "none" });
					break;
				}
				this.setSelection({
					type: "gameBoard",
					x: addSelection.x,
					y: addSelection.y,
				});
				break;
			case "deck":
				if (
					this.selection.type === "deck" &&
					this.selection.deck.id === addSelection.deck.id
				) {
					this.setSelection({ type: "none" });
					break;
				}
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
					if (this.selection.handCardIds.includes(addSelection.handCardId)) {
						this.setSelection({
							type: "handCards",
							handCardIds: this.selection.handCardIds.filter(
								(cardId) => cardId !== addSelection.handCardId
							),
						});
						break;
					}
					this.setSelection({
						type: "handCards",
						handCardIds: [
							...this.selection.handCardIds,
							addSelection.handCardId,
						],
					});
				} else {
					this.setSelection({
						type: "handCards",
						handCardIds: [addSelection.handCardId],
					});
				}
				break;
			default:
				break;
		}
	};

	bfsSelect = (card: CardGroup) => {
		if (!this.gameState) return;
		// make a map of card positions from game state
		const cardPos = new Map<number, CardGroup>();
		const hashPos = (c: CardGroup) => c.position.x + c.position.y * BOARD_WIDTH;
		Object.values(this.gameState.cards).forEach((c) => {
			cardPos.set(hashPos(c), c);
		});

		const queue: CardGroup[] = [card];
		const visited = new Set<number>();
		const cards: CardGroup[] = [];
		let index = 0;
		while (index < queue.length) {
			const current = queue[index++];
			if (!current) continue;
			const posHash = hashPos(current);
			if (visited.has(posHash)) continue;
			visited.add(posHash);

			// Add the current card to the selection
			cards.push(current);

			// Check adjacent positions
			const adjacentPositions = [
				{ x: current.position.x + 1, y: current.position.y },
				{ x: current.position.x - 1, y: current.position.y },
				{ x: current.position.x, y: current.position.y + 1 },
				{ x: current.position.x, y: current.position.y - 1 },
			];

			adjacentPositions.forEach((pos) => {
				const adjacentCard = cardPos.get(pos.x + pos.y * BOARD_WIDTH);
				if (adjacentCard && !visited.has(hashPos(adjacentCard))) {
					queue.push(adjacentCard);
				}
			});
		}

		this.setSelection({ type: "cards", cards });
	};
}

export const selectionStore = new SelectionStore();

export const selectionObject = {
	bfsSelect: selectionStore.bfsSelect,
	getCurSelection: selectionStore.getSelection,
	addSelection: selectionStore.addSelection,
	removeEntities: selectionStore.removeEntities,
	refresh: selectionStore.refresh,
	setSelection: selectionStore.setSelection,
	deselect: () => {
		selectionStore.setSelection({ type: "none" });
	},
};

export const useSelection = () => {
	const selection = useSyncExternalStore(
		selectionStore.subscribe,
		selectionStore.getSelection
	);

	return selection;
};

export const useSelectionChangeObserver = () => {
	const onFinish = useCallback(
		(cb: (start: GameSelection, end: GameSelection) => void) => {
			selectionStore.onChange = (start, end) => cb(start, end);
		},
		[]
	);

	return onFinish;
};

export const getCardIds = (
	selection: GameSelection,
	additionalId: number | null
): number[] => {
	const ids = new Set<number>();
	if (selection.type === "cards") {
		selection.cards.forEach((card) => ids.add(card.id));
	}
	if (selection.type === "handCards") {
		selection.handCardIds.forEach((id) => ids.add(id));
	}
	if (additionalId) {
		ids.add(additionalId);
	}
	return Array.from(ids);
};
