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

export class GameState {
	gameId: number;
	entities: Set<EntityId> = new Set();
	cards: { [id: EntityId]: CardGroup } = {};
	decks: { [id: EntityId]: DeckGroup } = {};
	hands: { [id: EntityId]: HandGroup } = {};
	players: PlayerDescription[] = [];

	constructor(initialState: GameJoined) {
		this.gameId = initialState.game_id;
		this.applyChanged(initialState.game_state);
		this.players = initialState.players;
	}

	getNickname = (clientId: number): string | undefined => {
		const player = this.players.find((player) => player.client_id === clientId);
		return player?.nickname;
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
		if (delta.changed) this.applyChanged(delta.changed);
		if (delta.deleted) this.applyDeleted(delta.deleted);
		if (delta.players) this.players = delta.players;
	};
}
