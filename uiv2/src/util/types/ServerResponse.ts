import { Result } from "./result";

export type HandleMessage = (message: ServerResponse) => Result<void, string>;
export type HandleChatMessage = (
	message: ChatMessageResponse
) => Result<void, string>;
export type HandleDelta = (delta: DeltaResponse) => Result<void, string>;

export type ServerResponse =
	| ClientConnectedResponse
	| AvailableGamesResponse
	| GameCreatedResponse
	| OkResponse
	| ErrorResponse
	| DeltaResponse
	| ChatMessageResponse
	| GameJoined
	| GameLeftResponse;

export type GameDescription = { game_id: number; player_ct: number };

interface ClientConnectedResponse {
	type: "ClientConnected";
	client_id: number;
}

interface AvailableGamesResponse {
	type: "AvailableGames";
	games: GameDescription[];
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

interface ChatMessageResponse {
	type: "ChatMessage";
	client_id: number;
	message: string;
}

interface GameLeftResponse {
	type: "GameLeft";
}

export interface GameJoined {
	type: "GameJoined";
	game_id: number;
	game_state: GameECS;
	players: PlayerDescription[];
}

export type Position = {
	x: number;
	y: number;
};

export type Card =
	| {
			type: "Card";
			rank: number;
			suit: "S" | "H" | "D" | "C" | "J";
			deck_id: number;
	  }
	| {
			type: "AnonCard";
			deck_id: number;
	  };

export type Deck = {
	deck_id: number;
	card_count: number;
	shuffle_ctr: number;
};

export type Hand = {
	nickname: string;
	client_id: number;
	cards: (
		| {
				type: "HandCard";
				rank: number;
				suit: "S" | "H" | "D" | "C" | "J";
				deck_id: number;
		  }
		| {
				type: "AnonHandCard";
				deck_id: number;
		  }
	)[];
};

export type GameECS = {
	entities: number[];
	positions: {
		[entity_id: number]: Position;
	};
	cards: {
		[entity_id: number]: Card;
	};
	decks: {
		[deck_id: number]: Deck;
	};
	hands: {
		[client_id: number]: Hand;
	};
};

export type PlayerDescription = {
	nickname: string;
	client_id: number;
	hand: number;
};

export type DeltaResponse = {
	type: "Delta";
	changed: null | GameECS;
	deleted: null | number[];
	players: null | PlayerDescription[];
};
