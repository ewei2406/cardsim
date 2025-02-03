import { useSyncExternalStore } from "react";
import { CardGroup, DeckGroup, HandGroup } from "./useGame";

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
			type: "hand";
			hand: HandGroup[];
			handCardIds: number[];
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
}

export const selectionStore = new SelectionStore();

export const useSelection = () => {
	const selection = useSyncExternalStore(
		selectionStore.subscribe,
		selectionStore.getSelection
	);

	const { select, deselect } = useSelect();

	return { selection, select, deselect };
};

export const useSelect = () => {
	const select = (selection: GameSelection) => {
		selectionStore.setSelection(selection);
	};

	const deselect = () => {
		selectionStore.setSelection({ type: "none" });
	};

	return { select, deselect };
};
