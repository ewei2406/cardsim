import { Result } from "../../util/result";

export type HandleMessage = (message: ServerResponse) => Result<void, string>;
export type HandleChatMessage = (
	message: ChatMessageResponse
) => Result<void, string>;
export type HandleDelta = (delta: DeltaResponse) => Result<void, string>;

export type ServerResponse =
	| AvailableGamesResponse
	| GameCreatedResponse
	| OkResponse
	| ErrorResponse
	| DeltaResponse
	| ChatMessageResponse
	| GameJoined
	| GameLeftResponse;

export type GameDescription = { game_id: number; player_ct: number };

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

interface GameJoined {
	type: "GameJoined";
	game_id: number;
	game_state: GameState;
}

export type Position = {
	x: number;
	y: number;
	z: number;
	rotation: number;
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

export type GameState = {
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
	players: {
		nickname: string;
		client_id: number;
		hand: number;
	}[];
};

export type DeltaResponse = {
	type: "Delta";
	changed: null | GameState;
	deleted: null | number[];
};
