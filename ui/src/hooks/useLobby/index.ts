import { useCallback, useEffect, useRef, useState } from "react";
import {
	GameDescription,
	GameState,
	HandleChatMessage,
	HandleDelta,
	HandleMessage,
} from "../useClient/ServerResponse";
import useClient from "../useClient";
import { ClientRequest } from "../useClient/ClientRequest";
import { logger } from "../useLogger";

type LobbyStatus =
	| {
			status: "ingame";
			initialGameState: GameState;
			gameId: number;
	  }
	| {
			status: "lobby";
	  }
	| {
			status: "joining";
			gameId: number;
	  };

const useLobby = () => {
	const { connected, sendMessage, onMessage, id } = useClient();
	const [availableGames, setAvailableGames] = useState<GameDescription[]>([]);
	const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>({
		status: "lobby",
	});

	const handleDeltaRef = useRef<HandleDelta | null>(null);

	const handleMessage: HandleMessage = useCallback((message) => {
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
				setLobbyStatus({
					status: "ingame",
					gameId: message.game_id,
					initialGameState: message.game_state,
				});
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
			case "GameCreated":
				logger.success(`Created game ${message.game_id}.`);
				return { variant: "ok", value: undefined };
			case "Ok":
				return { variant: "ok", value: undefined };
			default:
				logger.error("An unknown ocurred: " + JSON.stringify(message));
				return { variant: "error", error: `Unexpected message: ${message}` };
		}
	}, []);

	useEffect(() => {
		if (connected) {
			logger.success("Connected to server!");
			sendMessage({
				type: "Command",
				command: "ListGames",
			});
			onMessage(handleMessage);
		}
	}, [connected, sendMessage, handleMessage, onMessage]);

	const joinGame = useCallback(
		(gameId: number) => {
			setLobbyStatus({ status: "joining", gameId });
			sendMessage({
				type: "Command",
				command: "JoinGame",
				game_id: gameId,
				nickname: "default",
			});
		},
		[sendMessage]
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
	}, [sendMessage]);

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
			nickname: "default",
		});
	}, [sendMessage]);

	const onDelta = useCallback((handler: HandleDelta) => {
		handleDeltaRef.current = handler;
	}, []);

	const onChatMessage = useCallback((handler: HandleChatMessage) => {
		handleChatMessage.current = handler;
	}, []);

	const sendGameAction = useCallback(
		(action: ClientRequest & { type: "Action" }) => {
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
