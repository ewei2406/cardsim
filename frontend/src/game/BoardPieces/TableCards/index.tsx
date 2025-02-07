import { useSelection } from "@/hooks/useSelection";
import getTableCards from "./getTableCards";
import getTableDeckCards from "./getTableDeckCards";
import getTableHandCards from "./getTableHandCards";
import TableCard from "./TableCard";
import { GameState } from "@/util/GameState";
import { useUISettings } from "@/hooks/useUISettings";

const TableCards = ({ gameState }: { gameState: GameState }) => {
	const selection = useSelection();
	const { miniTableCards } = useUISettings();
	const tableCards = getTableCards(gameState.cards, selection, miniTableCards);
	const tableHandCards = getTableHandCards(
		gameState.playerMap,
		gameState.hands
	);
	const tableDeckCards = getTableDeckCards(gameState.decks, selection);
	const cards = [...tableHandCards, ...tableCards, ...tableDeckCards].sort(
		(a, b) => a.id - b.id
	);

	return (
		<>
			{cards.map((cardProps) => (
				<TableCard key={cardProps.id} {...cardProps} />
			))}
		</>
	);
};

export default TableCards;
