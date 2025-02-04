import { BOARD_WIDTH, BOARD_HEIGHT } from "./constants";
import {
	Card,
	Deck,
	DeltaResponse,
	GameECS,
	GameJoined,
	Hand,
	PlayerDescription,
	Position,
} from "./types/ServerResponse";

export type EntityId = number;
export type HandGroup = {
	id: EntityId;
	hand: Hand;
};

export type CardGroup = {
	id: EntityId;
	card: Card;
	position: Position;
};
export type DeckGroup = {
	id: EntityId;
	deck: Deck;
	position: Position;
};

const playerPosMap = {
	0: [2, 0],
	1: [1, 3],
	2: [0, 1],
	3: [3, 2],
	4: [1, 0],
	5: [2, 3],
	6: [0, 2],
	7: [3, 1],
};

const getPlayerPos = (playerIdx: number) => {
	const W = BOARD_WIDTH + 8;
	const H = BOARD_HEIGHT + 3;
	const [sx, sy] = playerPosMap[playerIdx as keyof typeof playerPosMap];
	const x = sx * (W / 3) - W / 2 - 0.5;
	const y = sy * (H / 3) - H / 2 + 0.5;
	return [x, y];
};

export type PlayerGroup = {
	client_id: number;
	hand: EntityId;
	nickname: string;
	order: number;
	x: number;
	y: number;
};

export class GameState {
	gameId: number;
	entities: Set<EntityId> = new Set();
	cards: { [id: EntityId]: CardGroup } = {};
	decks: { [id: EntityId]: DeckGroup } = {};
	hands: { [id: EntityId]: HandGroup } = {};
	players: PlayerDescription[] = [];
	playerMap: { [clientId: number]: PlayerGroup } = {};

	constructor(initialState: GameJoined) {
		this.gameId = initialState.game_id;
		this.applyChanged(initialState.game_state);
		this.updatePlayers(initialState.players);
	}

	getNickname = (clientId: number): string | undefined => {
		const player = this.players.find((player) => player.client_id === clientId);
		return player?.nickname;
	};

	updatePlayers = (players: PlayerDescription[]) => {
		this.players = players;
		this.playerMap = {};
		players.forEach((player, idx) => {
			const [x, y] = getPlayerPos(idx);
			this.playerMap[player.client_id] = {
				client_id: player.client_id,
				hand: player.hand,
				nickname: player.nickname,
				order: idx,
				x,
				y,
			};
		});
	};

	applyChanged = (changed: GameECS) => {
		changed.entities.forEach((entityId) => {
			this.entities.add(entityId);
			if (changed.cards[entityId] && changed.positions[entityId]) {
				this.cards[entityId] = {
					card: changed.cards[entityId],
					position: changed.positions[entityId],
					id: entityId,
				};
				return;
			}
			if (changed.decks[entityId] && changed.positions[entityId]) {
				this.decks[entityId] = {
					deck: changed.decks[entityId],
					position: changed.positions[entityId],
					id: entityId,
				};
				return;
			}
			if (changed.hands[entityId]) {
				this.hands[entityId] = {
					hand: changed.hands[entityId],
					id: entityId,
				};
				return;
			}
			console.error("Unknown entity: ", entityId);
		});
	};

	applyDeleted = (deleted: number[]) => {
		deleted.forEach((entityId) => {
			this.entities.delete(entityId);
			delete this.cards[entityId];
			delete this.decks[entityId];
			delete this.hands[entityId];
		});
	};

	applyDelta = (delta: DeltaResponse) => {
		if (delta.players) this.updatePlayers(delta.players);
		if (delta.changed) this.applyChanged(delta.changed);
		if (delta.deleted) this.applyDeleted(delta.deleted);
	};
}
