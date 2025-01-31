import { useCallback, useEffect, useRef, useState } from "react";
import {
	Card,
	Deck,
	Hand,
	HandleDelta,
	Position,
} from "../useClient/ServerResponse";
import useLobby from "../useLobby";

const useGame = (onDelta: ReturnType<typeof useLobby>["onDelta"]) => {
	const [updates, setUpdates] = useState(0);
	const entities = useRef<Set<number>>(new Set());
	const cardsRef = useRef<Record<number, Card & Position>>({});
	const decksRef = useRef<Record<number, Deck & Position>>({});
	const handsRef = useRef<Record<number, Hand>>({});
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
				};
				return;
			}
			if (changed.decks[entity] && changed.positions[entity]) {
				decksRef.current[entity] = {
					...changed.decks[entity],
					...changed.positions[entity],
				};
				return;
			}
			if (changed.hands[entity]) {
				const hand = changed.hands[entity];
				nicknamesRef.current[hand.client_id] = hand.nickname;
				handsRef.current[entity] = hand;
				return;
			}
			console.log("Unhandled entity type", changed, entity);
		});
		setUpdates((prev) => prev + 1);
		return { variant: "ok", value: undefined };
	}, []);

	useEffect(() => {
		console.log("useGame", onDelta);
		onDelta(handleDelta);
	}, [onDelta, handleDelta]);

	const [state, setState] = useState({
		entities: entities.current,
		cards: cardsRef.current,
		decks: decksRef.current,
		hands: handsRef.current,
		nicknames: nicknamesRef.current,
	});

	useEffect(() => {
		setState({
			entities: entities.current,
			cards: cardsRef.current,
			decks: decksRef.current,
			hands: handsRef.current,
			nicknames: nicknamesRef.current,
		});
	}, [updates]);

	return state;
};

export default useGame;
