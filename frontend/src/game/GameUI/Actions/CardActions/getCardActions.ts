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
			...HOTKEYS.CARD.DRAW,
			icon: TbHandStop,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "DrawCardsFromTable",
					cards: selection.cards.map((card) => card.id),
				});
				selectionObject.deselect();
			},
		},
		{
			...HOTKEYS.CARD.FLIP,
			icon: TbArrowCapsule,
			onClick: () => {
				sendMessage({
					type: "Action",
					action: "FlipCards",
					cards: selection.cards.map((card) => card.id),
				});
			},
		},
		{
			...HOTKEYS.CARD.REGROUP_ALL,
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
			backgroundColor: COLORS.SECONDARY,
		},
		{
			...HOTKEYS.CARD.DESELECT,
			icon: TbX,
			onClick: () => {
				selectionObject.deselect();
			},
			backgroundColor: COLORS.DARK,
		},
		{
			...HOTKEYS.CARD.DELETE,
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
		},
	];
};
