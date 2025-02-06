import { TbCards, TbX } from "react-icons/tb";
import { selectionObject } from "@/hooks/useSelection";
import { COLORS } from "@/util/colors";
import { GetActions } from "..";
import { HOTKEYS } from "@/util/hotkeys";

const getGameBoardActions: GetActions<{ type: "gameBoard" }> = (
	_selection,
	_sendMessage,
	openModal
) => [
	{
		...HOTKEYS.GAMEBOARD.NEW_DECK,
		icon: TbCards,
		onClick: () => openModal("newDeck"),
		backgroundColor: COLORS.SECONDARY,
	},
	{
		...HOTKEYS.GAMEBOARD.DESELECT,
		icon: TbX,
		onClick: selectionObject.deselect,
		backgroundColor: COLORS.DARK,
	},
];

export default getGameBoardActions;
