import { useSendMessage } from "@/context/useSendMessage";
import useMyHand from "@/hooks/useMyHand";
import { useSelection } from "@/hooks/useSelection";
import {
	MY_HAND_CARDS_MAX_ARC,
	MY_HAND_CARDS_SPACING_DEG,
	MY_HAND_CARD_SIZE,
} from "@/util/constants";
import { HandGroup, EntityId } from "@/util/GameState";
import { SendMessage } from "@/util/types/ClientRequest";
import { PlayerDescription } from "@/util/types/ServerResponse";
import { useState, useEffect } from "react";
import MyHandActions from "./MyHandActions";
import MyHandCard from "./MyHandCard";

const MyHandContent = ({
	hand,
	sendMessage,
}: {
	hand: HandGroup;
	sendMessage: SendMessage;
}) => {
	const { selection } = useSelection();
	const ids = selection.type === "handCards" ? selection.handCardIds : [];
	const [showHand, setShowHand] = useState(false);
	const {
		setHandCards,
		cardsOrder,
		draggingCard,
		setDraggingCard,
		handleDragOver,
		handleSort,
	} = useMyHand();

	useEffect(() => {
		setHandCards(hand.hand.cards);
	}, [hand, setHandCards]);

	const nMax = hand.hand.cards.length;
	const thetaMax = Math.min(
		showHand ? 20 : MY_HAND_CARDS_MAX_ARC,
		nMax * MY_HAND_CARDS_SPACING_DEG
	);

	return (
		<div
			style={{
				zIndex: 1001,
				position: "fixed",
				bottom: MY_HAND_CARD_SIZE,
				left: 0,
				right: 0,
				height: 0,
				display: "flex",
				flexDirection: "column",
				alignContent: "center",
				transition: "transform 0.2s ease",
				transform: `translateY(${showHand ? 0 : MY_HAND_CARD_SIZE}px)`,
			}}
		>
			<div
				className="center-content"
				style={{
					position: "relative",
					width: "100%",
					height: 0,
					transform: `translateY(${MY_HAND_CARD_SIZE * 1.5}px)`,
				}}
				onMouseLeave={() => {
					setDraggingCard(null);
				}}
				onMouseOver={(e) => e.stopPropagation()}
			>
				{hand.hand.cards.map((card) => (
					<MyHandCard
						key={card.id}
						handleDragOver={handleDragOver}
						setDraggingCard={setDraggingCard}
						setShowHand={setShowHand}
						draggingCard={draggingCard}
						n={cardsOrder.get(card.id) ?? 0}
						nMax={nMax}
						thetaMax={thetaMax}
						card={card}
						selected={ids.includes(card.id)}
					/>
				))}
			</div>
			<MyHandActions
				sendMessage={sendMessage}
				setShowHand={setShowHand}
				ids={ids}
				handleSort={handleSort}
			/>
		</div>
	);
};

const MyHand = ({
	hands,
	players,
	clientId,
}: {
	clientId: number;
	players: PlayerDescription[];
	hands: { [id: EntityId]: HandGroup };
}) => {
	const sendMessage = useSendMessage();

	const myHand = players.find((p) => p.client_id === clientId)?.hand;
	if (!myHand) {
		return <></>;
	}

	const hand = hands[myHand];
	if (!hand) {
		return <></>;
	}

	return <MyHandContent hand={hand} sendMessage={sendMessage} />;
};

export default MyHand;
