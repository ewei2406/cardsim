import { useCallback, useSyncExternalStore } from "react";

export type DragTarget =
	| {
			type: "void";
	  }
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
			x: number;
			y: number;
	  }
	| {
			type: "card";
			entityId: number;
			x: number;
			y: number;
	  }
	| {
			type: "hand";
			entityId: number;
			x: number;
			y: number;
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
			...this.drag,
			start,
		};
		this.notify();
	};

	hoverDrag = (end: DragTarget) => {
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

export const useDragFinishObserver = () => {
	const onFinish = useCallback(
		(cb: (start: DragTarget, end: DragTarget) => void) => {
			dragStore.onFinish = cb;
		},
		[]
	);

	return { onFinish };
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
