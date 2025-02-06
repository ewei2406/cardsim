import {
	TbArrowFork,
	TbArrowForwardUp,
	TbArrowsShuffle,
	TbArrowUp,
	TbHandStop,
	TbScissors,
	TbX,
} from "react-icons/tb";
import { RiFireLine } from "react-icons/ri";
import { IoLayersOutline } from "react-icons/io5";
import { selectionObject } from "@/hooks/useSelection";
import { COLORS } from "@/util/colors";
import { GetActions } from "..";
import { HOTKEYS } from "@/util/hotkeys";

export const getDeckActions: GetActions<{ type: "deck" }> = (
	selection,
	sendMessage,
	openModal
) => {
	const isSingleCard = selection.deck.deck.card_count <= 1;

	return [
		{
			label: "Draw",
			icon: TbArrowUp,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DrawCardFromDeck",
					deck: selection.deck.id,
				});
			},
			hotKey: HOTKEYS.DECK.DRAW,
			underlineIndex: 0,
		},
		{
			label: "Flip",
			icon: TbArrowForwardUp,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "FlipCardFromDeck",
					faceup: true,
					deck: selection.deck.id,
				});
			},
			hotKey: HOTKEYS.DECK.FLIP,
			underlineIndex: 0,
		},
		{
			label: "Burn",
			icon: RiFireLine,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "FlipCardFromDeck",
					faceup: false,
					deck: selection.deck.id,
				});
			},
			hotKey: HOTKEYS.DECK.BURN,
			underlineIndex: 0,
		},
		{
			label: "Shuffle",
			icon: TbArrowsShuffle,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "ShuffleDeck",
					deck: selection.deck.id,
				});
			},
			disabled: isSingleCard,
			hotKey: HOTKEYS.DECK.SHUFFLE,
			underlineIndex: 0,
		},
		{
			label: "Deal One",
			icon: TbArrowFork,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DealDeckSingle",
					deck: selection.deck.id,
				});
			},
			hotKey: HOTKEYS.DECK.DEAL_ONE,
			underlineIndex: 1,
		},
		{
			label: "Deal All",
			icon: TbArrowFork,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DealDeckAll",
					deck: selection.deck.id,
				});
				selectionObject.deselect();
			},
			hotKey: HOTKEYS.DECK.DEAL_ALL,
			underlineIndex: 5,
		},
		{
			label: "Regroup All",
			icon: IoLayersOutline,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "CollectDeck",
					deck_id: selection.deck.deck.deck_id,
					x1: selection.deck.position.x,
					y1: selection.deck.position.y,
				});
			},
			hotKey: HOTKEYS.DECK.REGROUP_ALL,
			underlineIndex: 0,
		},
		{
			label: "Return Hand",
			icon: TbHandStop,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "PlayAllHandCardsToDeck",
					deck: selection.deck.id,
				});
			},
			hotKey: HOTKEYS.DECK.RETURN_HAND,
			underlineIndex: 7,
		},
		{
			label: "Cut...",
			icon: TbScissors,
			onClick: () => openModal("cutDeck"),
			disabled: isSingleCard,
			hotKey: HOTKEYS.DECK.CUT,
			underlineIndex: 0,
		},
		{
			label: "Deselect",
			icon: TbX,
			onClick: selectionObject.deselect,
			backgroundColor: COLORS.DARK,
			hotKey: HOTKEYS.DECK.DESELECT,
		},
		{
			label: "Delete",
			icon: TbX,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "RemoveEntity",
					entity: selection.deck.id,
				});
				selectionObject.deselect();
			},
			backgroundColor: COLORS.DANGER,
			hotKey: HOTKEYS.DECK.DELETE,
		},
	];
};
