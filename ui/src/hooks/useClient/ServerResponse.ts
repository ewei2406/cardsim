import { Result } from "../../util/result";

export type HandleMessage = (message: ServerResponse) => Result<void, string>;

export type ServerResponse =
	| AvailableGamesResponse
	| GameCreatedResponse
	| OkResponse
	| ErrorResponse
	| DeltaResponse
	| ChatMessageResponse
	| GameJoined
	| GameLeftResponse;

interface AvailableGamesResponse {
	type: "AvailableGames";
	games: { game_id: number; player_ids: number[] }[];
}

interface GameCreatedResponse {
	type: "GameCreated";
	game_id: number;
}

interface OkResponse {
	type: "Ok";
}

interface ErrorResponse {
	type: "Error";
	message: string;
}

interface DeltaResponse {
	type: "Delta";
	// TODO: Fix this def
	changed: undefined;
	deleted: number[];
}

interface ChatMessageResponse {
	type: "ChatMessage";
	client_id: number;
	message: string;
}

interface GameLeftResponse {
	type: "GameLeft";
}

interface GameJoined {
	type: "GameJoined";
	game_id: number;
}
