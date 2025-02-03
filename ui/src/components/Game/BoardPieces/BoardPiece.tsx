import { ReactNode } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH, TILE_SIZE } from "../../../util/constants";

const BoardPiece = (props: {
	x: number;
	y: number;
	children: ReactNode;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
	onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
	onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
	disableInteraction?: boolean;
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
				userSelect: "none",
				pointerEvents: props.disableInteraction ? "none" : undefined,
			}}
			onClick={(e) => {
				if (props.onClick) {
					e.stopPropagation();
					props.onClick(e);
				}
			}}
			onMouseDown={(e) => {
				if (props.onMouseDown) {
					e.stopPropagation();
					props.onMouseDown(e);
				}
			}}
			onMouseUp={(e) => {
				if (props.onMouseUp) {
					e.stopPropagation();
					props.onMouseUp(e);
				}
			}}
			onMouseOver={(e) => {
				if (props.onMouseOver) {
					e.stopPropagation();
					props.onMouseOver(e);
				}
			}}
		>
			<div style={{ position: "relative" }}>{props.children}</div>
		</div>
	);
};

export default BoardPiece;
