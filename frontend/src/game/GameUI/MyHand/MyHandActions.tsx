import { useDragObserver } from "@/hooks/useDrag";
import { useSelection } from "@/hooks/useSelection";
import { CardOrdering, byRank, bySuit } from "@/util/cardOrdering";
import { SendMessage } from "@/util/types/ClientRequest";
import { TbNumber123, TbSpade, TbX, TbArrowUp } from "react-icons/tb";

const MyHandActions = ({
	sendMessage,
	setShowHand,
	handleSort,
	ids,
}: {
	sendMessage: SendMessage;
	setShowHand: (v: boolean) => void;
	handleSort: (sortFn: CardOrdering) => void;
	ids: number[];
}) => {
	const { selection, deselect } = useSelection();
	const { start } = useDragObserver();

	if (start.type !== "none") return <></>;

	const handlePlayCards = () => {
		if (selection.type === "handCards") {
			sendMessage({
				type: "Action",
				action: "PlayHandCards",
				cards: selection.handCardIds,
				faceup: true,
				x: 0,
				y: 0,
			});
			deselect();
		}
	};

	return (
		<div
			className="column"
			style={{
				justifyContent: "center",
				alignItems: "center",
				margin: "0 auto",
				zIndex: 1000,
			}}
			onMouseOver={() => setShowHand(true)}
		>
			<div style={{ display: "flex", gap: 5 }}>
				<button onClick={() => handleSort(byRank)}>
					<TbNumber123 />
					By Rank
				</button>
				<button onClick={() => handleSort(bySuit)}>
					<TbSpade />
					By Suit
				</button>
			</div>
			<div style={{ display: "flex", gap: 5 }}>
				<button disabled={ids.length === 0} onClick={handlePlayCards}>
					<TbArrowUp />
					Play
				</button>
				<button disabled={ids.length === 0} onClick={deselect}>
					<TbX />
					Deselect
				</button>
			</div>
		</div>
	);
};

export default MyHandActions;
