import { ReactNode, useMemo } from "react";
import { useSelect } from "../../../hooks/useSelection";
import { BOARD_WIDTH, BOARD_HEIGHT, TILE_SIZE } from "../../../util/constants";
import { COLORS } from "../../../util/colors";

const GameBoardTiles = () => {
	const { select } = useSelect();

	const gameBoardTiles: ReactNode[] = useMemo(() => {
		const arr = [];
		for (let i = 0; i < BOARD_WIDTH; i++) {
			for (let j = 0; j < BOARD_HEIGHT; j++) {
				arr.push(
					<div
						key={`${i}-${j}`}
						onClick={(e) => {
							select({
								type: "gameBoard",
								x: i - BOARD_WIDTH / 2,
								y: BOARD_HEIGHT / 2 - j,
							});
							e.stopPropagation();
						}}
						style={{
							position: "absolute",
							width: TILE_SIZE,
							height: TILE_SIZE,
							left: i * TILE_SIZE,
							top: j * TILE_SIZE,
							boxSizing: "border-box",
							border: `0.5px solid ${COLORS.LIGHTER}`,
						}}
					></div>
				);
			}
		}
		return arr;
	}, [select]);

	return <>{gameBoardTiles}</>;
};

export default GameBoardTiles;
