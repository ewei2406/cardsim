import { Result } from "../../util/result";

export type SendMessage = (message: ClientRequest) => Result<void, string>;

export type ClientRequest =
	| ListGamesRequest
	| CreateGameRequest
	| JoinGameRequest
	| ChatMessageRequest
	| LeaveGameRequest
	| ActionRequest;

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

type ActionRequest =
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
	type: "Action";
	action: "CreateDeck";
	x: number;
	y: number;
	card_inits: [string, number][];
}

interface CreateStandardDecksRequest {
	type: "Action";
	action: "CreateStandardDecks";
	x: number;
	y: number;
	n: number;
	jokers: boolean;
}

interface CutDeckRequest {
	type: "Action";
	action: "CutDeck";
	deck: number;
	n: number;
}

interface FlipCardsFromDeckRequest {
	type: "Action";
	action: "FlipCardsFromDeck";
	deck: number;
	n: number;
	faceup: boolean;
}

interface ShuffleDeckRequest {
	type: "Action";
	action: "ShuffleDeck";
	deck: number;
}

interface CollectDeckRequest {
	type: "Action";
	action: "CollectDeck";
	deck_id: number;
	x1: number;
	y1: number;
}

interface DrawCardFromTableRequest {
	type: "Action";
	action: "DrawCardFromTable";
	card: number;
}

interface DrawCardsFromLocationRequest {
	type: "Action";
	action: "DrawCardsFromLocation";
	x: number;
	y: number;
}

interface DrawCardFromDeckRequest {
	type: "Action";
	action: "DrawCardFromDeck";
	deck: number;
}

interface MoveEntityRequest {
	type: "Action";
	action: "MoveEntity";
	entity: number;
	x1: number;
	y1: number;
}

interface RemoveEntityRequest {
	type: "Action";
	action: "RemoveEntity";
	entity: number;
}

interface PlayHandCardsRequest {
	type: "Action";
	action: "PlayHandCards";
	cards: number[];
	x: number;
	y: number;
	faceup: boolean;
}

interface PlayHandCardsToDeckRequest {
	type: "Action";
	action: "PlayHandCardsToDeck";
	cards: number[];
	deck: number;
}

interface ShowHandCardsRequest {
	type: "Action";
	action: "ShowHandCards";
	cards: number[];
	shown: boolean;
}

interface AddHandRequest {
	type: "Action";
	action: "AddHand";
	nickname: string;
}

interface RemoveHandRequest {
	type: "Action";
	action: "RemoveHand";
}
