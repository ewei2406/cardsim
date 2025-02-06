import { TbCards, TbX } from "react-icons/tb";
import { selectionObject } from "@/hooks/useSelection";
import { COLORS } from "@/util/colors";
import { GetActions } from "..";

const getGameBoardActions: GetActions<{ type: "gameBoard" }> = (
	_selection,
	_sendMessage,
	openModal
) => [
	{
		label: "New Deck...",
		icon: TbCards,
		onClick: () => openModal("newDeck"),
		backgroundColor: COLORS.SECONDARY,
		hotKey: "d",
		underlineIndex: 4,
	},
	{
		label: "Deselect",
		icon: TbX,
		onClick: selectionObject.deselect,
		backgroundColor: COLORS.DARK,
		hotKey: "Escape",
	},
];

export default getGameBoardActions;
