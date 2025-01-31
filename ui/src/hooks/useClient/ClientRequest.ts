export type ClientRequest =
	| ListGamesRequest
	| CreateGameRequest
	| JoinGameRequest
	| ChatMessageRequest
	| LeaveGameRequest
	| GameActionRequest;

interface ListGamesRequest {
	type: "Command";
	command: "ListGames";
}

interface CreateGameRequest {
	type: "Command";
	command: "CreateGame";
	nickname: string;
}

interface JoinGameRequest {
	type: "Command";
	command: "JoinGame";
	game_id: number;
	nickname: string;
}

interface ChatMessageRequest {
	type: "Command";
	command: "ChatMessage";
	message: string;
}

interface LeaveGameRequest {
	type: "Command";
	command: "LeaveGame";
}

type GameActionRequest =
	| CreateDeckRequest
	| CreateStandardDecksRequest
	| CutDeckRequest
	| FlipCardsFromDeckRequest
	| ShuffleDeckRequest
	| CollectDeckRequest
	| DrawCardFromTableRequest
	| DrawCardsFromLocationRequest
	| DrawCardFromDeckRequest
	| MoveEntityRequest
	| RemoveEntityRequest
	| PlayHandCardsRequest
	| PlayHandCardsToDeckRequest
	| ShowHandCardsRequest
	| AddHandRequest
	| RemoveHandRequest;

interface CreateDeckRequest {
	type: "GameAction";
	action: "CreateDeck";
	x: number;
	y: number;
	card_inits: [string, number][];
}

interface CreateStandardDecksRequest {
	type: "GameAction";
	action: "CreateStandardDecks";
	x: number;
	y: number;
	n: number;
	jokers: boolean;
}

interface CutDeckRequest {
	type: "GameAction";
	action: "CutDeck";
	deck: number;
	n: number;
	x1: number;
	y1: number;
}

interface FlipCardsFromDeckRequest {
	type: "GameAction";
	action: "FlipCardsFromDeck";
	deck: number;
	n: number;
	x1: number;
	y1: number;
}

interface ShuffleDeckRequest {
	type: "GameAction";
	action: "ShuffleDeck";
	deck: number;
}

interface CollectDeckRequest {
	type: "GameAction";
	action: "CollectDeck";
	deck_id: number;
	x1: number;
	y1: number;
}

interface DrawCardFromTableRequest {
	type: "GameAction";
	action: "DrawCardFromTable";
	card: number;
}

interface DrawCardsFromLocationRequest {
	type: "GameAction";
	action: "DrawCardsFromLocation";
	x: number;
	y: number;
}

interface DrawCardFromDeckRequest {
	type: "GameAction";
	action: "DrawCardFromDeck";
	deck: number;
}

interface MoveEntityRequest {
	type: "GameAction";
	action: "MoveEntity";
	entity: number;
	x1: number;
	y1: number;
}

interface RemoveEntityRequest {
	type: "GameAction";
	action: "RemoveEntity";
	entity: number;
}

interface PlayHandCardsRequest {
	type: "GameAction";
	action: "PlayHandCards";
	cards: number[];
	x: number;
	y: number;
	faceup: boolean;
}

interface PlayHandCardsToDeckRequest {
	type: "GameAction";
	action: "PlayHandCardsToDeck";
	cards: number[];
	deck: number;
}

interface ShowHandCardsRequest {
	type: "GameAction";
	action: "ShowHandCards";
	cards: number[];
	shown: boolean;
}

interface AddHandRequest {
	type: "GameAction";
	action: "AddHand";
	nickname: string;
}

interface RemoveHandRequest {
	type: "GameAction";
	action: "RemoveHand";
}
