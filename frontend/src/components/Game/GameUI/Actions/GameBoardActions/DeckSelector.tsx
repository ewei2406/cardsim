import { useState } from "react";
import Toggle from "../../../../Toggle";
import { TbCards } from "react-icons/tb";

export type DeckProps =
	| {
			action: "CreateStandardDecks";
			n: number;
			jokers: boolean;
	  }
	| {
			action: "CreateDeck";
			card_inits: [string, number][];
	  };

const DeckSelector = (props: {
	handleCreate: (deckProps: DeckProps) => void;
}) => {
	const [deckProps, setDeckProps] = useState<DeckProps>({
		action: "CreateStandardDecks",
		n: 1,
		jokers: true,
	});

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<div className="row">
				Deck Type
				<select
					value={deckProps.action}
					onChange={(e) => {
						const value = e.target.value as
							| "CreateStandardDecks"
							| "CreateDeck";
						if (value === "CreateStandardDecks") {
							setDeckProps({ action: value, n: 1, jokers: true });
						} else {
							setDeckProps({ action: value, card_inits: [] });
						}
					}}
				>
					<option value="CreateStandardDecks">Standard Deck</option>
					<option value="CreateDeck">Custom Deck</option>
				</select>
			</div>
			{deckProps.action === "CreateStandardDecks" ? (
				<>
					<div className="row">
						Number of Decks
						<input
							style={{
								width: "50px",
							}}
							type="number"
							value={deckProps.n}
							onChange={(e) =>
								setDeckProps({ ...deckProps, n: Math.max(+e.target.value, 1) })
							}
						/>
					</div>
					<div className="row">
						Jokers
						<Toggle
							checked={deckProps.jokers}
							onChange={(checked) =>
								setDeckProps({ ...deckProps, jokers: checked })
							}
						/>
					</div>
				</>
			) : (
				<>
					<div className="row"></div>
				</>
			)}

			<div style={{ marginTop: 10 }}>
				<button
					style={{ marginLeft: "auto" }}
					onClick={() => props.handleCreate(deckProps)}
				>
					<TbCards />
					Create
				</button>
			</div>
		</div>
	);
};

export default DeckSelector;
