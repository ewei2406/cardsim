export type ServerResponse =
	| AvailableGamesResponse
	| GameCreatedResponse
	| OkResponse
	| ErrorResponse
	| DeltaResponse
	| ChatMessageResponse
	| GameClosedResponse;

interface AvailableGamesResponse {
	type: "AvailableGames";
	games: { id: number; players: number }[];
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

interface GameClosedResponse {
	type: "GameClosed";
}
