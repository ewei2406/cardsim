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
			...HOTKEYS.DECK.DRAW,
			icon: TbArrowUp,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DrawCardFromDeck",
					deck: selection.deck.id,
				});
			},
		},
		{
			...HOTKEYS.DECK.FLIP,
			icon: TbArrowForwardUp,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "FlipCardFromDeck",
					faceup: true,
					deck: selection.deck.id,
				});
			},
		},
		{
			...HOTKEYS.DECK.BURN,
			icon: RiFireLine,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "FlipCardFromDeck",
					faceup: false,
					deck: selection.deck.id,
				});
			},
		},
		{
			...HOTKEYS.DECK.SHUFFLE,
			icon: TbArrowsShuffle,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "ShuffleDeck",
					deck: selection.deck.id,
				});
			},
			disabled: isSingleCard,
		},
		{
			...HOTKEYS.DECK.DEAL_ONE,
			icon: TbArrowFork,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DealDeckSingle",
					deck: selection.deck.id,
				});
			},
		},
		{
			...HOTKEYS.DECK.DEAL_ALL,
			icon: TbArrowFork,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DealDeckAll",
					deck: selection.deck.id,
				});
				selectionObject.deselect();
			},
		},
		{
			...HOTKEYS.DECK.CUT,
			icon: TbScissors,
			onClick: () => openModal("cutDeck"),
			disabled: isSingleCard,
		},
		{
			...HOTKEYS.DECK.REGROUP_ALL,
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
			backgroundColor: COLORS.SECONDARY,
		},
		{
			...HOTKEYS.DECK.RETURN_HAND,
			icon: TbHandStop,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "PlayAllHandCardsToDeck",
					deck: selection.deck.id,
				});
			},
			backgroundColor: COLORS.SECONDARY,
		},
		{
			...HOTKEYS.DECK.DESELECT,
			icon: TbX,
			onClick: selectionObject.deselect,
			backgroundColor: COLORS.DARK,
		},
		{
			...HOTKEYS.DECK.DELETE,
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
		},
	];
};
