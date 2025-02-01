import { useSyncExternalStore } from "react";

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
			entityId: number;
	  }
	| {
			type: "cards";
			entityIds: number[];
	  }
	| {
			type: "hand";
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
		console.log("select", selection);
		selectionStore.setSelection(selection);
	};

	const deselect = () => {
		selectionStore.setSelection({ type: "none" });
	};

	return { select, deselect };
};
