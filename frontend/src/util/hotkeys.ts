export const HOTKEYS = {
	HAND: {
		SELECT_ALL: { hotKey: "a", label: "Select all", underlineIndex: 8 },
		BY_SUIT: { hotKey: "s", label: "By suit", underlineIndex: 3 },
		BY_RANK: { hotKey: "r", label: "By rank", underlineIndex: 3 },
		FACEDOWN: { hotKey: "W", label: "Facedown (W)", underlineIndex: 10 },
		PLAY: { hotKey: "w", label: "Play (w)", underlineIndex: 6 },
	},
	CARD: {
		DRAW: { hotKey: "d", label: "draw", underlineIndex: 0 },
		FLIP: { hotKey: "f", label: "flip", underlineIndex: 0 },
		REGROUP_ALL: { hotKey: "R", label: "Regroup all", underlineIndex: 0 },
		DELETE: { hotKey: "Backspace", label: "Delete" },
		DESELECT: { hotKey: "Escape", label: "Deselect" },
	},
	DECK: {
		DRAW: { hotKey: "d", label: "draw", underlineIndex: 0 },
		FLIP: { hotKey: "f", label: "flip", underlineIndex: 0 },
		BURN: { hotKey: "b", label: "burn", underlineIndex: 0 },
		SHUFFLE: { hotKey: "S", label: "Shuffle", underlineIndex: 0 },
		DEAL_ONE: { hotKey: "D", label: "Deal one", underlineIndex: 0 },
		DEAL_ALL: { hotKey: "A", label: "Deal All", underlineIndex: 5 },
		REGROUP_ALL: { hotKey: "R", label: "Regroup all", underlineIndex: 0 },
		RETURN_HAND: { hotKey: "h", label: "Return hand", underlineIndex: 7 },
		CUT: { hotKey: "c", label: "cut", underlineIndex: 0 },
		DESELECT: { hotKey: "Escape", label: "Deselect" },
		DELETE: { hotKey: "Backspace", label: "Delete" },
	},
	GAMEBOARD: {
		NEW_DECK: { hotKey: "d", label: "New deck", underlineIndex: 4 },
		DESELECT: { hotKey: "Escape", label: "Deselect" },
	},
} as const;
