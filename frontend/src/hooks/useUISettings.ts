import { useSyncExternalStore } from "react";

class UISettingsStore {
	settings = {
		miniTableCards: true,
	};
	listeners = new Set<() => void>();

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	notify = () => {
		this.listeners.forEach((listener) => listener());
	};

	setMiniTableCards = (miniTableCards: boolean) => {
		this.settings = {
			...this.settings,
			miniTableCards,
		};
		this.notify();
	};

	getUISettings = () => {
		return this.settings;
	};
}

const uiSettingsStore = new UISettingsStore();

export const uiSettingsObject = {
	setMiniTableCards: uiSettingsStore.setMiniTableCards,
};

export const useUISettings = () => {
	return useSyncExternalStore(
		uiSettingsStore.subscribe,
		uiSettingsStore.getUISettings
	);
};
