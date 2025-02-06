import { TbArrowCapsule, TbHandStop, TbX } from "react-icons/tb";
import { IoLayersOutline } from "react-icons/io5";
import { selectionObject } from "@/hooks/useSelection";
import { COLORS } from "@/util/colors";
import { GetActions } from "..";
import { HOTKEYS } from "@/util/hotkeys";

export const getCardActions: GetActions<{ type: "cards" }> = (
	selection,
	sendMessage
) => {
	let regroupId =
		selection.cards.length === 0 ? null : selection.cards[0].card.deck_id;
	selection.cards.forEach((card) => {
		if (card.card.deck_id !== regroupId) {
			regroupId = null;
		}
	});

	return [
		{
			label: "Draw",
			icon: TbHandStop,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DrawCardsFromTable",
					cards: selection.cards.map((card) => card.id),
				});
				selectionObject.deselect();
			},
			hotKey: HOTKEYS.CARD.DRAW,
			underlineIndex: 0,
		},
		{
			label: "Flip",
			icon: TbArrowCapsule,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "FlipCards",
					cards: selection.cards.map((card) => card.id),
				});
			},
			hotKey: HOTKEYS.CARD.FLIP,
			underlineIndex: 0,
		},
		{
			label: "Regroup All",
			icon: IoLayersOutline,
			onClick: () => {
				if (!regroupId) {
					return;
				}
				sendMessage({
					type: "Action",
					action: "CollectDeck",
					deck_id: regroupId,
					x1: selection.cards[selection.cards.length - 1].position.x,
					y1: selection.cards[selection.cards.length - 1].position.y,
				});
				selectionObject.deselect();
			},
			disabled: !regroupId,
			hotKey: HOTKEYS.CARD.REGROUP_ALL,
			underlineIndex: 0,
		},
		{
			label: "Deselect",
			icon: TbX,
			onClick: () => {
				selectionObject.deselect();
			},
			backgroundColor: COLORS.DARK,
			hotKey: HOTKEYS.CARD.DESELECT,
		},
		{
			label: "Delete",
			icon: TbX,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "RemoveEntities",
					entities: selection.cards.map((card) => card.id),
				});
				selectionObject.deselect();
			},
			backgroundColor: COLORS.DANGER,
			hotKey: HOTKEYS.CARD.DELETE,
		},
	];
};
