import { useCallback, useSyncExternalStore } from "react";
import { GameSelection, useSelection } from "./useSelection";
import { PlayerGroup } from "@/util/GameState";
import { Position, Deck, Card } from "@/util/types/ServerResponse";

export type DragTarget =
	| {
			type: "void";
	  }
	| {
			type: "none";
	  }
	| {
			type: "gameBoard";
			position: Position;
	  }
	| {
			type: "deck";
			deck: Deck;
			position: Position;
			id: number;
	  }
	| {
			type: "card";
			card: Card;
			position: Position;
			id: number;
	  }
	| {
			type: "myHandCard";
			cardId: number;
	  }
	| {
			type: "myHand";
	  };

export const getXY = (
	target: DragTarget,
	playerGroup: PlayerGroup
): [number, number] => {
	switch (target.type) {
		case "card":
		case "deck":
		case "gameBoard":
			return [target.position.x, target.position.y];
		case "myHand":
		case "myHandCard":
			return [playerGroup.x, playerGroup.y];
		default:
			return [0, 0];
	}
};

class DragStore {
	drag: { start: DragTarget; end: DragTarget } = {
		start: { type: "none" },
		end: { type: "none" },
	};
	listeners = new Set<() => void>();
	onFinish?: (start: DragTarget, end: DragTarget) => void;

	constructor() {}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	notify = () => {
		this.listeners.forEach((listener) => listener());
	};

	getDrag = () => {
		return this.drag;
	};

	setStart = (start: DragTarget) => {
		this.drag = {
			start,
			end: { type: "none" },
		};
		this.notify();
	};

	hoverDrag = (end: DragTarget) => {
		if (this.drag.start === end) return;
		this.drag = {
			...this.drag,
			end,
		};
		this.notify();
	};

	finish = (target: DragTarget) => {
		this.onFinish?.(this.drag.start, target);
		this.drag = {
			start: { type: "none" },
			end: { type: "none" },
		};
		this.notify();
	};
}

export const dragStore = new DragStore();
document.addEventListener("mouseup", () => {
	dragStore.setStart({ type: "none" });
});

export const useDragFinishObserver = () => {
	const selection = useSelection();

	const onFinish = useCallback(
		(
			cb: (
				start: DragTarget,
				end: DragTarget,
				curSelection: GameSelection
			) => void
		) => {
			dragStore.onFinish = (start, end) => cb(start, end, selection);
		},
		[selection]
	);

	return onFinish;
};

export const useDragObserver = () => {
	const subscribe = useCallback(
		(listener: () => void) => dragStore.subscribe(listener),
		[]
	);
	const getDrag = useCallback(() => dragStore.getDrag(), []);

	const drag = useSyncExternalStore(subscribe, getDrag);

	return drag;
};

export const useDrag = () => {
	const startDrag = (target: DragTarget) => {
		dragStore.setStart(target);
	};

	const hoverDrag = (target: DragTarget) => {
		dragStore.hoverDrag(target);
	};

	const finishDrag = (target: DragTarget) => {
		dragStore.finish(target);
	};

	return {
		startDrag,
		hoverDrag,
		finishDrag,
	};
};

export const dragObject = {
	startDrag: dragStore.setStart,
	hoverDrag: dragStore.hoverDrag,
	finishDrag: dragStore.finish,
};
