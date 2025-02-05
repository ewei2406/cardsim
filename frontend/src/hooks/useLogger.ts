import { LOG_STALE_MS, LOG_CLEAR_INTERVAL_MS } from "@/util/constants";
import { useSyncExternalStore } from "react";

export type Log = {
	message: string;
	time: Date;
	severity: "success" | "info" | "warn" | "error";
};

class LogsStore {
	logs: Log[] = [];
	listeners = new Set<() => void>();

	addLog = (log: Log) => {
		this.logs = [...this.logs, log];
		this.notify();
	};

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	notify = () => {
		this.listeners.forEach((listener) => listener());
	};

	clearStale = () => {
		const now = new Date().getTime();
		this.logs = this.logs.filter(
			(log) => log.time.getTime() + LOG_STALE_MS > now
		);
		this.notify();
	};

	getLogs = () => {
		return this.logs;
	};
}

const logsStore = new LogsStore();
setInterval(() => {
	logsStore.clearStale();
}, LOG_CLEAR_INTERVAL_MS);

const log = (message: string, severity: Log["severity"]) => {
	logsStore.addLog({ message, time: new Date(), severity });
};

export const logger = {
	success: (message: string) => log(message, "success"),
	info: (message: string) => log(message, "info"),
	warn: (message: string) => log(message, "warn"),
	error: (message: string) => log(message, "error"),
};

export const useLogs = () => {
	return useSyncExternalStore(logsStore.subscribe, logsStore.getLogs);
};
