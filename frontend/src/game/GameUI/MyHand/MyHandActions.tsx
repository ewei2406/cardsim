import { useDragObserver } from "@/hooks/useDrag";
import { selectionObject, useSelection } from "@/hooks/useSelection";
import { CardOrdering, byRank, bySuit } from "@/util/cardOrdering";
import { SendMessage } from "@/util/types/ClientRequest";
import {
	TbNumber123,
	TbSpade,
	TbX,
	TbArrowUp,
	TbEyeOff,
	TbPlus,
} from "react-icons/tb";
import { COLORS } from "@/util/colors";
import { CSSProperties, useEffect } from "react";
import ActionButton from "../Actions/ActionButton";
import { HOTKEYS } from "@/util/hotkeys";

const keyMap: Record<string, number> = {
	"1": 0,
	"2": 1,
	"3": 2,
	"4": 3,
	"5": 4,
	"6": 5,
	"7": 6,
	"8": 7,
	"9": 8,
	"0": 9,
	"-": 10,
	"=": 11,
};

const MyHandActions = ({
	sendMessage,
	showHand,
	setShowHand,
	handleSort,
	ids,
	cardIds,
	reverseCardsOrder,
}: {
	sendMessage: SendMessage;
	setShowHand: (showHand: boolean) => void;
	showHand: boolean;
	handleSort: (sortFn: CardOrdering) => void;
	ids: number[];
	cardIds: number[];
	reverseCardsOrder: Map<number, number>;
}) => {
	const selection = useSelection();
	const { start, end } = useDragObserver();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (keyMap[event.key] !== undefined) {
				const index = keyMap[event.key];
				const cardId = reverseCardsOrder.get(index);
				if (index >= 0 && index < cardIds.length && cardId) {
					selectionObject.addSelection({
						type: "handCard",
						handCardId: cardId,
					});
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [cardIds, reverseCardsOrder]);

	if (start.type !== "none") return <></>;

	const handlePlayCards = (faceup: boolean) => {
		if (selection.type === "handCards") {
			sendMessage({
				type: "Action",
				action: "PlayHandCards",
				cards: selection.handCardIds,
				faceup,
				x: end.type === "gameBoard" ? end.position.x : 0,
				y: end.type === "gameBoard" ? end.position.y : 0,
			});
			selectionObject.deselect();
		}
	};

	const isAllSelected =
		selection.type === "handCards" &&
		selection.handCardIds.length === cardIds.length;

	const handleSelectAll = () => {
		if (isAllSelected) {
			selectionObject.deselect();
			return;
		}
		selectionObject.setSelection({
			type: "handCards",
			handCardIds: cardIds,
		});
	};

	const style: CSSProperties = showHand
		? { bottom: 0, left: 0, right: 0 }
		: {
				right: 0,
				top: 0,
				bottom: 0,
				alignItems: "flex-end",
		  };

	const groupStyle: CSSProperties = showHand
		? {
				display: "flex",
				flexDirection: "row",
				gap: 5,
		  }
		: {
				display: "flex",
				flexDirection: "column",
				gap: 5,
				width: "100%",
		  };

	return (
		<div
			onMouseOver={() => (showHand ? setShowHand(true) : null)}
			className="column"
			style={{
				position: "fixed",
				justifyContent: "center",
				alignItems: "center",
				margin: "0 auto",
				zIndex: 1010,
				userSelect: "none",
				...style,
			}}
		>
			{!showHand && "Hand Actions"}
			<div style={groupStyle}>
				<ActionButton
					{...HOTKEYS.HAND.PLAY}
					icon={TbArrowUp}
					onClick={() => handlePlayCards(true)}
					disabled={ids.length === 0}
				/>
				<ActionButton
					{...HOTKEYS.HAND.FACEDOWN}
					icon={TbEyeOff}
					onClick={() => handlePlayCards(false)}
					disabled={ids.length === 0}
				/>
			</div>
			<div style={groupStyle}>
				<ActionButton
					{...HOTKEYS.HAND.BY_RANK}
					icon={TbNumber123}
					onClick={() => handleSort(byRank)}
					backgroundColor={COLORS.SECONDARY}
				/>
				<ActionButton
					{...HOTKEYS.HAND.BY_SUIT}
					icon={TbSpade}
					onClick={() => handleSort(bySuit)}
					backgroundColor={COLORS.SECONDARY}
				/>
			</div>
			<div style={groupStyle}>
				<ActionButton
					{...HOTKEYS.HAND.SELECT_ALL}
					icon={isAllSelected ? TbX : TbPlus}
					onClick={handleSelectAll}
					backgroundColor={isAllSelected ? COLORS.DARK : undefined}
				/>
			</div>
		</div>
	);
};

export default MyHandActions;
