import { useState } from "react";
import { TbScissors } from "react-icons/tb";
import { DeckGroup } from "../../../../../util/GameState";

const CutDeck = ({
	deck,
	handleCut,
}: {
	deck: DeckGroup;
	handleCut: (n: number) => void;
}) => {
	const [cutPosition, setCutPosition] = useState(
		Math.floor(deck.deck.card_count / 2)
	);

	return (
		<div>
			<div style={{ marginBottom: 10 }}>
				<div className="row">
					<label htmlFor="cutPosition">Cut Depth:</label>
					<div className="row">
						{cutPosition}/{deck.deck.card_count}
						<input
							type="range"
							id="cutPosition"
							name="cutPosition"
							min={1}
							max={deck.deck.card_count - 1}
							value={cutPosition}
							onChange={(e) => setCutPosition(parseInt(e.target.value))}
						/>
					</div>
				</div>
			</div>
			<button
				style={{ marginLeft: "auto" }}
				onClick={() => {
					handleCut(cutPosition);
				}}
			>
				<TbScissors />
				Cut
			</button>
		</div>
	);
};

export default CutDeck;
