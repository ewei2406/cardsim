import { useCallback, useEffect, useState } from "react";
import { HandleMessage } from "../useClient/ServerResponse";
import useClient from "../useClient";
import { useLogger } from "../useLogger";

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
				default:
					logger.error("An unknown ocurred: " + message);
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

	const joinGame = (gameId: number) => {
		sendMessage({
			type: "Command",
			command: "JoinGame",
			game_id: gameId,
			nickname: "Test Player",
		});
	};

	const leaveGame = () => {
		sendMessage({
			type: "Command",
			command: "LeaveGame",
		});
	};

	const refreshGames = () => {
		logger.info("Refreshing games...");
		sendMessage({
			type: "Command",
			command: "ListGames",
		});
	};

	return {
		id,
		availableGames,
		joinGame,
		leaveGame,
		refreshGames,
		lobbyStatus,
		handleMessage,
	};
};

export default useLobby;
