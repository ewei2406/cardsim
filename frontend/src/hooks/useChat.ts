import { CHAT_STALE_MS, CHAT_UPDATE_INTERVAL_MS } from "@/util/constants";
import { getUUID } from "@/util/id";
import { useSyncExternalStore } from "react";

export type ChatMessage = {
	id: number;
	clientId: number;
	message: string;
	nickname: string;
	date: Date;
	stale: boolean;
};

type MessageProps = {
	clientId: number;
	message: string;
	nickname: string;
};

class ChatStorage {
	messages: ChatMessage[] = [];
	listeners = new Set<() => void>();

	constructor() {}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	notify = () => {
		this.listeners.forEach((listener) => listener());
	};

	addMessage = (messageProps: MessageProps) => {
		const message: ChatMessage = {
			...messageProps,
			id: getUUID(),
			date: new Date(),
			stale: false,
		};
		this.messages = [...this.messages, message];
		this.notify();
	};

	markStale = () => {
		this.messages = this.messages.map((message) =>
			Date.now() - message.date.getTime() > CHAT_STALE_MS
				? { ...message, stale: true }
				: message
		);
		this.notify();
	};

	clear = () => {
		this.messages = [];
		this.notify();
	};

	getMessages = () => {
		return this.messages;
	};
}

const chatStorage = new ChatStorage();
setInterval(() => {
	chatStorage.markStale();
}, CHAT_UPDATE_INTERVAL_MS);

export const chat = {
	addMessage: chatStorage.addMessage,
};

export const useChatHistory = () => {
	return useSyncExternalStore(chatStorage.subscribe, chatStorage.getMessages);
};
