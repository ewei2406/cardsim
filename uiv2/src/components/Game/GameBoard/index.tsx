import { ReactNode, useRef } from "react";
import {
	BOARD_HEIGHT,
	BOARD_WIDTH,
	TILE_HEIGHT,
	TILE_WIDTH,
} from "../../../util/constants";
import { COLORS } from "../../../util/colors";
import { useSelect } from "../../../hooks/useSelection";
import { useDrag } from "../../../hooks/useDrag";

const GameBoard = ({
	children,
	gameId,
	rotated,
}: {
	children?: ReactNode;
	gameId: number;
	rotated?: boolean;
}) => {
	const gameBoardRef = useRef<HTMLDivElement>(null);
	const { deselect } = useSelect();
	const { hoverDrag, finishDrag } = useDrag();

	return (
		<div
			id="game-board"
			className="center-content"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			}}
			onClick={(e) => {
				deselect();
				e.stopPropagation();
			}}
			onMouseOver={(e) => {
				if (e.button === 0) {
					hoverDrag({
						type: "void",
					});
					e.stopPropagation();
				}
			}}
			onMouseUp={(e) => {
				if (e.button === 0) {
					finishDrag({
						type: "void",
					});
					e.stopPropagation();
				}
			}}
		>
			<div
				className="center-content column"
				style={{
					position: "relative",
					minWidth: BOARD_WIDTH * TILE_WIDTH,
					minHeight: BOARD_HEIGHT * TILE_HEIGHT,
					width: BOARD_WIDTH * TILE_WIDTH,
					height: BOARD_HEIGHT * TILE_HEIGHT,
					backgroundColor: "transparent",
					border: `5px solid ${COLORS.LIGHTER}`,
					transform: `perspective(750px) rotateX(45deg) translateZ(-100px) ${
						rotated ? "rotateZ(180deg)" : ""
					}`,
				}}
				ref={gameBoardRef}
			>
				<div
					style={{
						fontWeight: 800,
						color: COLORS.LIGHTER,
						fontSize: TILE_WIDTH * 3,
						opacity: 0.3,
						userSelect: "none",
						pointerEvents: "none",
						transform: "rotateZ(180deg)",
					}}
				>
					GAME {gameId}
				</div>
				<div
					style={{
						fontWeight: 800,
						color: COLORS.LIGHTER,
						fontSize: TILE_WIDTH * 3,
						opacity: 0.3,
						userSelect: "none",
						pointerEvents: "none",
					}}
				>
					GAME {gameId}
				</div>
				{children}
			</div>
		</div>
	);
};

export default GameBoard;
