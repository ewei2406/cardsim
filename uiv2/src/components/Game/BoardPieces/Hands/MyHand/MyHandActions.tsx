import { TbNumber123, TbSpade, TbX, TbArrowUp } from "react-icons/tb";
import { useSelection } from "../../../../../hooks/useSelection";
import { byRank, bySuit, CardOrdering } from "../../../../../util/cardOrdering";

const MyHandActions = ({
	setShowHand,
	handleSort,
	ids,
}: {
	setShowHand: (v: boolean) => void;
	handleSort: (sortFn: CardOrdering) => void;
	ids: number[];
}) => {
	const { deselect } = useSelection();

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
				<button>
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
