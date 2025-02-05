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
	0: [2, 0, 0],
	1: [1, 3, 180],
	2: [0, 1, 270],
	3: [3, 2, 90],
	4: [1, 0, 0],
	5: [2, 3, 180],
	6: [0, 2, 270],
	7: [3, 1, 90],
};

const getPlayerPos = (playerIdx: number) => {
	const W = BOARD_WIDTH + 4;
	const H = BOARD_HEIGHT + 4;
	const [sx, sy, rot] = playerPosMap[playerIdx as keyof typeof playerPosMap];
	const x = sx * (W / 3) - W / 2 - 0.5;
	const y = sy * (H / 3) - H / 2 + 0.5;
	return [x, y, rot];
};

export type PlayerGroup = {
	client_id: number;
	hand: EntityId;
	nickname: string;
	order: number;
	x: number;
	y: number;
	rot: number;
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
			const [x, y, rot] = getPlayerPos(idx);
			this.playerMap[player.client_id] = {
				client_id: player.client_id,
				hand: player.hand,
				nickname: player.nickname,
				order: idx,
				x,
				y,
				rot,
			};
		});
	};

	applyChanged = (changed: GameECS) => {
		console.log("changed entities", changed.entities);
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
