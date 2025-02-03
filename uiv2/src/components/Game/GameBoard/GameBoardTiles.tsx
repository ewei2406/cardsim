import { Fragment, useState } from "react";
import {
	BOARD_WIDTH,
	BOARD_HEIGHT,
	TILE_WIDTH,
	TILE_HEIGHT,
} from "../../../util/constants";
import { COLORS } from "../../../util/colors";
import { useSelect, useSelection } from "../../../hooks/useSelection";
import { useDrag } from "../../../hooks/useDrag";

const GBTile = ({
	i,
	j,
	selected,
}: {
	i: number;
	j: number;
	selected?: boolean;
}) => {
	const { setSelection } = useSelect();
	const { hoverDrag, finishDrag } = useDrag();
	const [border, setBorder] = useState(`0.5px solid ${COLORS.LIGHTER}`);

	return (
		<div
			onClick={(e) => {
				setSelection({
					type: "gameBoard",
					x: i - BOARD_WIDTH / 2,
					y: BOARD_HEIGHT / 2 - j,
				});
				e.stopPropagation();
			}}
			onMouseEnter={(e) => {
				if (e.buttons === 1) {
					setBorder(`3px dotted ${COLORS.LIGHT}`);
				} else {
					setBorder(`1px solid ${COLORS.LIGHT}`);
				}
			}}
			onMouseLeave={() => {
				setBorder(`0.5px solid ${COLORS.LIGHTER}`);
			}}
			onMouseOver={(e) => {
				hoverDrag({
					type: "gameBoard",
					position: { x: i - BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2 - j },
				});
				e.stopPropagation();
			}}
			onMouseUp={(e) => {
				if (e.button === 0) {
					e.stopPropagation();
					finishDrag({
						type: "gameBoard",
						position: {
							x: i - BOARD_WIDTH / 2,
							y: BOARD_HEIGHT / 2 - j,
						},
					});
					setBorder(`1px solid ${COLORS.LIGHT}`);
				}
			}}
			style={{
				position: "absolute",
				width: TILE_WIDTH,
				height: TILE_HEIGHT,
				left: i * TILE_WIDTH,
				top: j * TILE_HEIGHT,
				boxSizing: "border-box",
				border: selected ? `2px solid ${COLORS.SELECTION}` : border,
			}}
		></div>
	);
};

const X = Array.from({ length: BOARD_WIDTH }, (_, i) => i);
const Y = Array.from({ length: BOARD_HEIGHT }, (_, i) => i);

const GameBoardTiles = () => {
	const { selection } = useSelection();
	console.log(selection);
	return (
		<>
			{X.map((x) => (
				<Fragment key={x}>
					{Y.map((y) => (
						<GBTile
							key={`${x}-${y}`}
							i={x}
							j={y}
							selected={
								selection.type === "gameBoard" &&
								selection.x === x - BOARD_WIDTH / 2 &&
								selection.y === BOARD_HEIGHT / 2 - y
							}
						/>
					))}
				</Fragment>
			))}
		</>
	);
};

export default GameBoardTiles;
