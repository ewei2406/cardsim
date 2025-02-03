import { useEffect, useRef, useState } from "react";
import { ServerResponse } from "./ServerResponse";

type WsStatus =
	| { status: "disconnected" }
	| { status: "connected"; ws: WebSocket };

const useWs = (url: string) => {
	const [wsStatus, setWsStatus] = useState<WsStatus>({
		status: "disconnected",
	});
	const messageBuffer = useRef<ServerResponse[]>([]);

	useEffect(() => {
		const ws = new WebSocket(url);
		ws.addEventListener("open", () => {
			setWsStatus({ status: "connected", ws });
			console.log("Connection established!");
		});
		ws.addEventListener("close", () => {
			setWsStatus({ status: "disconnected" });
			console.log("Connection closed!");
		});
		ws.addEventListener("message", (event) => {
			const message = JSON.parse(event.data);
			messageBuffer.current.push(message);
		});
		ws.addEventListener("error", (event) => {
			console.error("WebSocket error:", event);
		});

		return () => {
			ws.close();
		};
	}, [url]);

	return { wsStatus, messageBuffer };
};

export default useWs;
