import { useCallback, useEffect, useRef, useState } from "react";
import {
	Card,
	Deck,
	GameState,
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

const useGame = (props: {
	onDelta: ReturnType<typeof useLobby>["onDelta"];
	sendGameAction: ReturnType<typeof useLobby>["sendGameAction"];
	gameId: number;
	initialGameState: GameState;
}) => {
	const [updates, setUpdates] = useState(0);
	const entities = useRef<Set<number>>(new Set());
	const cardsRef = useRef<Record<number, CardGroup>>({});
	const decksRef = useRef<Record<number, DeckGroup>>({});
	const handsRef = useRef<Record<number, HandGroup>>({});
	const nicknamesRef = useRef<Record<number, string>>({});

	const handleGameUpdate = useCallback((gameState: GameState) => {
		gameState.entities.forEach((entity) => {
			entities.current.add(entity);
			if (gameState.cards[entity] && gameState.positions[entity]) {
				cardsRef.current[entity] = {
					...gameState.cards[entity],
					...gameState.positions[entity],
					id: entity,
				};
				return;
			}
			if (gameState.decks[entity] && gameState.positions[entity]) {
				decksRef.current[entity] = {
					...gameState.decks[entity],
					...gameState.positions[entity],
					id: entity,
				};
				return;
			}
			if (gameState.hands[entity]) {
				const hand = gameState.hands[entity];
				nicknamesRef.current[hand.client_id] = hand.nickname;
				handsRef.current[entity] = { ...hand, id: entity };
				return;
			}
		});
	}, []);

	const handleDelta: HandleDelta = useCallback(
		(delta) => {
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
			handleGameUpdate(changed);
			setUpdates((prev) => prev + 1);
			return { variant: "ok", value: undefined };
		},
		[handleGameUpdate]
	);

	useEffect(() => {
		console.log("here!", props);
		handleGameUpdate(props.initialGameState);
	}, [handleGameUpdate, props]);

	useEffect(() => {
		props.onDelta(handleDelta);
	}, [props, handleDelta]);

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

	const handleDragFinish = useCallback(
		(start: DragTarget, end: DragTarget) => {
			switch (end.type) {
				case "void":
					if (
						start.type !== "void" &&
						start.type !== "none" &&
						start.type !== "gameBoard"
					) {
						props.sendGameAction({
							type: "Action",
							action: "RemoveEntity",
							entity: start.entityId,
						});
					}
					return;
				case "gameBoard":
					if (start.type === "card" || start.type === "deck") {
						props.sendGameAction({
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
		},
		[props]
	);

	useEffect(() => {
		onFinish(handleDragFinish);
	}, [handleDragFinish, onFinish]);

	return { ...gameState, sendGameAction: props.sendGameAction };
};

export default useGame;
