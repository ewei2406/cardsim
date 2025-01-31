import { useCallback, useEffect, useRef, useState } from "react";
import {
	HandleChatMessage,
	HandleDelta,
	HandleMessage,
} from "../useClient/ServerResponse";
import useClient from "../useClient";
import { useLogger } from "../useLogger";
import { ClientRequest } from "../useClient/ClientRequest";

type LobbyStatus =
	| {
			status: "ingame";
			gameId: number;
	  }
	| {
			status: "lobby";
	  };

export type GameDescription = { game_id: number; player_ids: number[] };

const useLobby = () => {
	const { logger } = useLogger();
	const { connected, sendMessage, onMessage, id } = useClient();
	const [availableGames, setAvailableGames] = useState<GameDescription[]>([]);
	const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>({
		status: "lobby",
	});
	const [nickname, setNickname] = useState("Player");

	const handleDeltaRef = useRef<HandleDelta | null>(null);
	const handleChatMessage = useRef<HandleChatMessage | null>(null);

	const handleMessage: HandleMessage = useCallback(
		(message) => {
			switch (message.type) {
				case "AvailableGames":
					setAvailableGames(message.games);
					logger.success("Available games refreshed.");
					return { variant: "ok", value: undefined };
				case "Error":
					logger.error("An error ocurred: " + message.message);
					return { variant: "error", error: message.message };
				case "GameJoined":
					logger.success(`Joined game ${message.game_id}.`);
					setLobbyStatus({ status: "ingame", gameId: message.game_id });
					return { variant: "ok", value: undefined };
				case "GameLeft":
					logger.info(`Left game.`);
					setLobbyStatus({ status: "lobby" });
					return { variant: "ok", value: undefined };
				case "Delta":
					if (handleDeltaRef.current === null) {
						logger.error("Recieved delta but not in a game!");
						return { variant: "error", error: "No handleDelta function set" };
					}
					return handleDeltaRef.current(message);
				case "ChatMessage":
					if (handleChatMessage.current === null) {
						logger.error("Recieved chat message but not in a game!");
						return {
							variant: "error",
							error: "No handleChatMessage function set",
						};
					}
					return handleChatMessage.current(message);
				case "GameCreated":
					logger.success(`Created game ${message.game_id}.`);
					return { variant: "ok", value: undefined };
				case "Ok":
					return { variant: "ok", value: undefined };
				default:
					logger.error("An unknown ocurred: " + JSON.stringify(message));
					return { variant: "error", error: `Unexpected message: ${message}` };
			}
		},
		[logger]
	);

	useEffect(() => {
		if (connected) {
			logger.success("Connected to server!");
			sendMessage({
				type: "Command",
				command: "ListGames",
			});
			onMessage(handleMessage);
		}
	}, [connected, sendMessage, handleMessage, onMessage, logger]);

	const joinGame = useCallback(
		(gameId: number) => {
			sendMessage({
				type: "Command",
				command: "JoinGame",
				game_id: gameId,
				nickname,
			});
		},
		[nickname, sendMessage]
	);

	const leaveGame = useCallback(() => {
		sendMessage({
			type: "Command",
			command: "LeaveGame",
		});
	}, [sendMessage]);

	const refreshGames = useCallback(() => {
		logger.info("Refreshing games...");
		sendMessage({
			type: "Command",
			command: "ListGames",
		});
	}, [sendMessage, logger]);

	const sendChatMessage = useCallback(
		(message: string) => {
			sendMessage({
				type: "Command",
				command: "ChatMessage",
				message,
			});
		},
		[sendMessage]
	);

	const createGame = useCallback(() => {
		sendMessage({
			type: "Command",
			command: "CreateGame",
			nickname,
		});
	}, [sendMessage, nickname]);

	const onDelta = useCallback((handler: HandleDelta) => {
		handleDeltaRef.current = handler;
	}, []);

	const onChatMessage = useCallback((handler: HandleChatMessage) => {
		handleChatMessage.current = handler;
	}, []);

	const sendGameAction = useCallback(
		(action: ClientRequest & { type: "GameAction" }) => {
			sendMessage(action);
		},
		[sendMessage]
	);

	return {
		id,
		nickname,
		availableGames,
		lobbyStatus,
		setNickname,
		joinGame,
		createGame,
		leaveGame,
		refreshGames,
		handleMessage,
		onDelta,
		onChatMessage,
		sendGameAction,
		sendChatMessage,
	};
};

export default useLobby;
