import { ReactNode, useRef } from "react";
import {
	BOARD_DISTANCE,
	BOARD_HEIGHT,
	BOARD_LIFT,
	BOARD_LR_PLAYER_OFFSET,
	BOARD_LR_PLAYER_ROT,
	BOARD_PERSPECTIVE,
	BOARD_TILT,
	BOARD_WIDTH,
	TILE_HEIGHT,
	TILE_WIDTH,
} from "../../../util/constants";
import { COLORS } from "../../../util/colors";
import GameBoardSelection from "./GameBoardSelection";
import GameBoardTiles from "./GameBoardTiles";

const GameBoard = ({
	children,
	gameId,
	isOnRight,
}: {
	children?: ReactNode;
	gameId: number;
	isOnRight: boolean;
}) => {
	const gameBoardRef = useRef<HTMLDivElement>(null);

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
				pointerEvents: "none",
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
					transform: `
						perspective(${BOARD_PERSPECTIVE}px) 
						rotateX(${BOARD_TILT}deg) 
						rotateZ(${isOnRight ? -BOARD_LR_PLAYER_ROT : BOARD_LR_PLAYER_ROT}deg)
						translateZ(${BOARD_LIFT}px) 
						translateY(${BOARD_DISTANCE}px) 
						translateX(${isOnRight ? BOARD_LR_PLAYER_OFFSET : -BOARD_LR_PLAYER_OFFSET}px)`,
				}}
				ref={gameBoardRef}
			>
				<GameBoardTiles />
				<GameBoardSelection />
				{children}
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
			</div>
		</div>
	);
};

export default GameBoard;
