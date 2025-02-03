import { useCallback, useEffect, useRef, useState } from "react";
import {
	Card,
	Deck,
	Hand,
	HandleDelta,
	Position,
} from "../useClient/ServerResponse";
import useLobby from "../useLobby";
import { DragTarget, useDragFinishObserver } from "../useDrag";

export type Id = { id: number };
export type DeckGroup = Deck & Position & Id;
export type CardGroup = Card & Position & Id;
export type HandGroup = Hand & Id;

const useGame = (
	onDelta: ReturnType<typeof useLobby>["onDelta"],
	sendGameAction: ReturnType<typeof useLobby>["sendGameAction"]
) => {
	const [updates, setUpdates] = useState(0);
	const entities = useRef<Set<number>>(new Set());
	const cardsRef = useRef<Record<number, CardGroup>>({});
	const decksRef = useRef<Record<number, DeckGroup>>({});
	const handsRef = useRef<Record<number, HandGroup>>({});
	const nicknamesRef = useRef<Record<number, string>>({});

	const handleDelta: HandleDelta = useCallback((delta) => {
		if (delta.deleted) {
			delta.deleted.forEach((entity) => {
				entities.current.delete(entity);
				delete cardsRef.current[entity];
				delete decksRef.current[entity];
				if (handsRef.current[entity]) {
					delete nicknamesRef.current[handsRef.current[entity].client_id];
				}
				delete handsRef.current[entity];
			});
			setUpdates((prev) => prev + 1);
		}
		if (delta.changed === null) {
			return { variant: "ok", value: undefined };
		}
		const changed = delta.changed;
		changed.entities.forEach((entity) => {
			entities.current.add(entity);
			if (changed.cards[entity] && changed.positions[entity]) {
				cardsRef.current[entity] = {
					...changed.cards[entity],
					...changed.positions[entity],
					id: entity,
				};
				return;
			}
			if (changed.decks[entity] && changed.positions[entity]) {
				decksRef.current[entity] = {
					...changed.decks[entity],
					...changed.positions[entity],
					id: entity,
				};
				return;
			}
			if (changed.hands[entity]) {
				const hand = changed.hands[entity];
				nicknamesRef.current[hand.client_id] = hand.nickname;
				handsRef.current[entity] = { ...hand, id: entity };
				return;
			}
			// TODO: handle other entity types
			// console.log("Unhandled entity type", changed, entity);
		});
		setUpdates((prev) => prev + 1);
		return { variant: "ok", value: undefined };
	}, []);

	useEffect(() => {
		onDelta(handleDelta);
	}, [onDelta, handleDelta]);

	const [gameState, setGameState] = useState({
		entities: entities.current,
		cards: cardsRef.current,
		decks: decksRef.current,
		hands: handsRef.current,
		nicknames: nicknamesRef.current,
	});

	useEffect(() => {
		setGameState({
			entities: entities.current,
			cards: cardsRef.current,
			decks: decksRef.current,
			hands: handsRef.current,
			nicknames: nicknamesRef.current,
		});
	}, [updates]);

	const { onFinish } = useDragFinishObserver();

	const handleDragFinish = useCallback((start: DragTarget, end: DragTarget) => {
		switch (end.type) {
			case "void":
				if (
					start.type !== "void" &&
					start.type !== "none" &&
					start.type !== "gameBoard"
				) {
					sendGameAction({
						type: "Action",
						action: "RemoveEntity",
						entity: start.entityId,
					});
				}
				return;
			case "gameBoard":
				if (start.type === "card" || start.type === "deck") {
					sendGameAction({
						type: "Action",
						action: "MoveEntity",
						entity: start.entityId,
						x1: end.x,
						y1: end.y,
					});
				}
				return;
			default:
				console.log("Unhandled drag target", end);
		}
	}, []);

	useEffect(() => {
		onFinish(handleDragFinish);
	}, [handleDragFinish, onFinish]);

	return { ...gameState, sendGameAction };
};

export default useGame;
