import { useCallback, useEffect, useRef, useState } from "react";
import { HandleMessage, ServerResponse } from "./ServerResponse";
import { SendMessage } from "./ClientRequest";

const useClient = () => {
	const [id, setId] = useState(0);
	const socketRef = useRef<WebSocket | null>(null);
	const messageHandlerRef = useRef<HandleMessage | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		socketRef.current = new WebSocket("ws://localhost:8080");

		socketRef.current.onopen = () => {
			setConnected(true);
			console.log("WebSocket connected");
		};

		socketRef.current.onclose = () => {
			setConnected(false);
			console.log("WebSocket disconnected");
		};

		socketRef.current.onmessage = (event) => {
			setId(event.data);
			socketRef.current!.onmessage = (event) => {
				const message: ServerResponse = JSON.parse(event.data);
				messageHandlerRef.current?.(message);
			};
		};

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, []);

	const sendMessage: SendMessage = useCallback((message) => {
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
	}, []);

	const onMessage = useCallback((handler: HandleMessage) => {
		messageHandlerRef.current = handler;
	}, []);

	return {
		id,
		connected,
		sendMessage,
		onMessage,
	};
};

export default useClient;
