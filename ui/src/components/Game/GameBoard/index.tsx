import { ReactNode, useRef } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH, TILE_SIZE } from "../../../util/constants";
import { COLORS } from "../../../util/colors";
import { useSelect } from "../../../hooks/useSelection";

const GameBoard = ({ children }: { children?: ReactNode }) => {
	const gameBoardRef = useRef<HTMLDivElement>(null);
	const { deselect } = useSelect();

	return (
		<div
			id="game-board"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
			onClick={(e) => {
				deselect();
				e.stopPropagation();
			}}
		>
			<div
				style={{
					position: "relative",
					width: BOARD_WIDTH * TILE_SIZE,
					height: BOARD_HEIGHT * TILE_SIZE,
					backgroundColor: COLORS.LIGHTEST,
					border: `5px solid ${COLORS.LIGHTER}`,
					transform: "perspective(750px) rotateX(45deg) translateZ(-100px)",
				}}
				ref={gameBoardRef}
			>
				{children}
			</div>
		</div>
	);
};

export default GameBoard;
