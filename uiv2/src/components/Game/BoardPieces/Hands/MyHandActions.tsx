import { TbNumber123, TbSpade, TbPlayCardOff, TbX } from "react-icons/tb";
import { useSelection } from "../../../../hooks/useSelection";
import { byRank, bySuit, CardOrdering } from "../../../../util/cardOrdering";

const MyHandActions = ({
	setShowHand,
	setCalcPriority,
	ids,
}: {
	setShowHand: (v: boolean) => void;
	setCalcPriority: React.Dispatch<React.SetStateAction<CardOrdering>>;
	ids: number[];
}) => {
	const { deselect } = useSelection();

	return (
		<div
			className="column"
			style={{
				position: "absolute",
				bottom: 40,
				left: 0,
				right: 0,
				justifyContent: "center",
				alignItems: "center",
			}}
			onMouseOver={() => setShowHand(true)}
		>
			<div style={{ display: "flex", gap: 5 }}>
				<button onClick={() => setCalcPriority(() => byRank)}>
					<TbNumber123 />
					By Rank
				</button>
				<button onClick={() => setCalcPriority(() => bySuit)}>
					<TbSpade />
					By Suit
				</button>
			</div>
			<div style={{ display: "flex", gap: 5 }}>
				<button>
					<TbPlayCardOff />
					Dump
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
