import { ReactNode } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH, TILE_SIZE } from "../../../util/constants";

const BoardPiece = (props: {
	x: number;
	y: number;
	children: ReactNode;
	onClick?: () => void;
}) => {
	return (
		<div
			style={{
				position: "absolute",
				width: TILE_SIZE,
				height: TILE_SIZE,
				left: (props.x + BOARD_WIDTH / 2) * TILE_SIZE,
				top: (BOARD_HEIGHT / 2 - props.y) * TILE_SIZE,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
			onClick={(e) => {
				e.stopPropagation();
				props.onClick?.();
			}}
		>
			<div style={{ position: "relative" }}>{props.children}</div>
		</div>
	);
};

export default BoardPiece;
