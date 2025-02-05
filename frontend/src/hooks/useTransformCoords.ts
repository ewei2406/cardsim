import { useSyncExternalStore } from "react";
import {
	BOARD_HEIGHT,
	BOARD_WIDTH,
	TILE_HEIGHT,
	TILE_WIDTH,
} from "../util/constants";

class TransformStore {
	transform: (x: number, y: number) => [number, number] = (x, y) => [
		(x + BOARD_WIDTH / 2) * TILE_WIDTH,
		(BOARD_HEIGHT / 2 - y) * TILE_HEIGHT,
	];
	rot = 0;
	listeners = new Set<() => void>();

	setTransform = (rot: number) => {
		console.log("setting transform: ", rot);
		this.rot = rot;
		switch (rot) {
			case 0:
				this.transform = (x, y) => [
					(x + BOARD_WIDTH / 2) * TILE_WIDTH,
					(BOARD_HEIGHT / 2 - y) * TILE_HEIGHT,
				];
				break;
			case 90:
				this.transform = (x, y) => {
					const x2 = y - 1;
					const y2 = -x;
					return [
						(x2 + BOARD_WIDTH / 2) * TILE_WIDTH,
						(BOARD_HEIGHT / 2 - y2) * TILE_HEIGHT,
					];
				};
				break;
			case 180:
				this.transform = (x, y) => {
					const x2 = -x - 1;
					const y2 = -y + 1;
					return [
						(x2 + BOARD_WIDTH / 2) * TILE_WIDTH,
						(BOARD_HEIGHT / 2 - y2) * TILE_HEIGHT,
					];
				};
				break;
			case 270:
				this.transform = (x, y) => {
					const x2 = -y;
					const y2 = x + 1;
					return [
						(x2 + BOARD_WIDTH / 2) * TILE_WIDTH,
						(BOARD_HEIGHT / 2 - y2) * TILE_HEIGHT,
					];
				};
				break;
			default:
				console.error("Invalid rotation: ", rot);
				this.transform = (x, y) => [
					(x + BOARD_WIDTH / 2) * TILE_WIDTH,
					(BOARD_HEIGHT / 2 - y) * TILE_HEIGHT,
				];
				break;
		}
		this.notify();
	};

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	notify = () => {
		this.listeners.forEach((listener) => listener());
	};

	getTransform = () => {
		return this.transform;
	};

	getRot = () => {
		return this.rot;
	};
}

const transformStore = new TransformStore();

export const updateTransform = (rot: number) => {
	transformStore.setTransform(rot);
};

export const useRot = () => {
	return useSyncExternalStore(transformStore.subscribe, transformStore.getRot);
};

export const useTransform = () => {
	return useSyncExternalStore(
		transformStore.subscribe,
		transformStore.getTransform
	);
};
