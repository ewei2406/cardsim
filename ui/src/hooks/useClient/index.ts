import { useEffect, useRef, useState } from "react";
import { Result } from "../../util/result";
import { ClientRequest } from "./ClientRequest";
import { ServerResponse } from "./ServerResponse";

const useClient = (onMessage: (message: ServerResponse) => void) => {
	const socketRef = useRef<WebSocket | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		socketRef.current = new WebSocket("ws://your-websocket-url");

		socketRef.current.onopen = () => {
			setConnected(true);
			console.log("WebSocket connected");
		};

		socketRef.current.onclose = () => {
			setConnected(false);
			console.log("WebSocket disconnected");
		};

		socketRef.current.onmessage = (event) => {
			const message: ServerResponse = JSON.parse(event.data);
			onMessage(message);
		};

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, [onMessage]);

	const sendMessage = (message: ClientRequest): Result<void, string> => {
		if (!socketRef.current) {
			return { variant: "error", error: "WebSocket not initialized" };
		}
		if (socketRef.current.readyState !== WebSocket.OPEN) {
			return { variant: "error", error: "WebSocket not open" };
		}

		try {
			socketRef.current.send(JSON.stringify(message));
			return { variant: "ok", value: undefined };
		} catch (error) {
			return { variant: "error", error: (error as Error).message };
		}
	};

	return {
		connected,
		sendMessage,
	};
};

export default useClient;
