import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "./useLogger";
import { chat } from "./useChat";
import { DragTarget, useDragFinishObserver } from "./useDrag";
import { GameSelection, getCardIds, selectionObject } from "./useSelection";
import { GameState } from "@/util/GameState";
import { ClientRequest } from "@/util/types/ClientRequest";
import { GameDescription, ServerResponse } from "@/util/types/ServerResponse";

type LobbyStatus =
	| {
			status: "ingame";
			gameId: number;
			game: GameState;
	  }
	| {
			status: "lobby";
	  };

type WsStatus =
	| {
			status: "disconnected";
	  }
	| {
			status: "connected";
			ws: WebSocket;
	  };

export const useLobby = () => {
	const [wsStatus, setWsStatus] = useState<WsStatus>({
		status: "disconnected",
	});
	const lobbyStatusRef = useRef<LobbyStatus>({ status: "lobby" });
	const [availableGames, setAvailableGames] = useState<GameDescription[]>([]);
	const [clientId, setClientId] = useState<number | null>(null);
	const [gameUpdates, setGameUpdates] = useState(0);
	const onDragFinish = useDragFinishObserver();

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8080");
		ws.addEventListener("open", () => {
			console.log("connected");
			setWsStatus({ status: "connected", ws });
		});
		ws.addEventListener("close", (event) => {
			console.log("disconnected", event);
		});
		ws.addEventListener("message", (event) => {
			const res = JSON.parse(event.data) as ServerResponse;
			switch (res.type) {
				case "ClientConnected":
					setClientId(res.client_id);
					logger.success("Connected to server.");
					break;
				case "GameJoined":
					lobbyStatusRef.current = {
						status: "ingame",
						gameId: res.game_id,
						game: new GameState(res),
					};
					console.log("Applying delta", res);
					setGameUpdates((prev) => prev + 1);
					break;
				case "AvailableGames":
					setAvailableGames(res.games);
					logger.success("Available games received.");
					break;
				case "GameCreated":
					logger.success(`Created game ${res.game_id}.`);
					break;
				case "GameLeft":
					logger.info("Left game.");
					lobbyStatusRef.current = { status: "lobby" };
					setGameUpdates((prev) => prev + 1);
					break;
				case "Error":
					logger.error(res.message);
					console.error(res);
					break;
				case "Delta":
					if (lobbyStatusRef.current.status === "ingame") {
						lobbyStatusRef.current.game.applyDelta(res);
						setGameUpdates((prev) => prev + 1);
					} else {
						console.error("No game state to apply delta to!");
					}
					break;
				case "ChatMessage":
					if (lobbyStatusRef.current.status === "ingame") {
						const nickname =
							lobbyStatusRef.current.game.getNickname(res.client_id) ??
							"Unknown";
						chat.addMessage({
							clientId: res.client_id,
							message: res.message,
							nickname,
						});
					}
					break;
				case "Ok":
					break;
				default:
					console.error("Unknown message type", res);
			}
		});

		return () => {
			ws.close();
		};
	}, []);

	const sendMessage = useCallback(
		(msg: ClientRequest) => {
			if (wsStatus.status === "connected") {
				wsStatus.ws.send(JSON.stringify(msg));
			}
		},
		[wsStatus]
	);

	useEffect(() => {
		sendMessage({ type: "Command", command: "ListGames" });
	}, [sendMessage]);

	useEffect(() => {
		if (lobbyStatusRef.current.status === "lobby") {
			sendMessage({ type: "Command", command: "ListGames" });
		}
	}, [sendMessage, gameUpdates]);

	const handleDragFinish = useCallback(
		(start: DragTarget, end: DragTarget, curSelection: GameSelection) => {
			switch (end.type) {
				case "gameBoard":
					if (start.type === "deck") {
						sendMessage({
							type: "Action",
							action: "MoveEntity",
							entity: start.id,
							x1: end.position.x,
							y1: end.position.y,
						});
					}
					if (start.type === "myHandCard") {
						sendMessage({
							type: "Action",
							action: "PlayHandCards",
							cards: getCardIds(curSelection, start.cardId),
							faceup: true,
							x: end.position.x,
							y: end.position.y,
						});
					}
					if (start.type === "card") {
						sendMessage({
							type: "Action",
							action: "MoveEntities",
							entities: getCardIds(curSelection, start.id),
							x1: end.position.x,
							y1: end.position.y,
						});
					}
					break;
				case "void":
					if (start.type === "deck") {
						sendMessage({
							type: "Action",
							action: "RemoveEntity",
							entity: start.id,
						});
						selectionObject.deselect();
					}
					if (start.type === "card") {
						sendMessage({
							type: "Action",
							action: "RemoveEntities",
							entities: getCardIds(curSelection, start.id),
						});
						selectionObject.deselect();
					}
					break;
				case "myHand":
					if (start.type === "card") {
						sendMessage({
							type: "Action",
							action: "DrawCardsFromTable",
							cards: getCardIds(curSelection, start.id),
						});
						selectionObject.deselect();
						break;
					}
					if (start.type === "deck") {
						sendMessage({
							type: "Action",
							action: "DrawCardFromDeck",
							deck: start.id,
						});
						selectionObject.deselect();
						break;
					}
					break;
				case "deck":
					if (start.type === "card") {
						sendMessage({
							type: "Action",
							action: "ReturnCardsToDeck",
							cards: getCardIds(curSelection, start.id),
							deck: end.id,
						});
						selectionObject.deselect();
					}
					if (start.type === "myHandCard") {
						sendMessage({
							type: "Action",
							action: "PlayHandCardsToDeck",
							cards: getCardIds(curSelection, start.cardId),
							deck: end.id,
						});
						selectionObject.deselect();
					}
					break;
				default:
					// TODO: Handle other drag targets
					break;
			}
		},
		[sendMessage]
	);

	useEffect(() => {
		onDragFinish(handleDragFinish);
	}, [handleDragFinish, onDragFinish]);

	return {
		availableGames,
		clientId,
		lobbyStatus: lobbyStatusRef.current,
		gameUpdates,
		sendMessage,
	};
};
