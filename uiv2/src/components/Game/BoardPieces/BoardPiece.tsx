import { ReactNode } from "react";
import {
	BOARD_HEIGHT,
	BOARD_WIDTH,
	TILE_HEIGHT,
	TILE_WIDTH,
} from "../../../util/constants";

const BoardPiece = (props: {
	x: number;
	y: number;
	dz?: number;
	children?: ReactNode;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
	onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
	onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
	disableInteraction?: boolean;
	style?: React.CSSProperties;
}) => {
	return (
		<div
			style={{
				border: "1px solid red",
				position: "absolute",
				width: TILE_WIDTH,
				height: TILE_HEIGHT,
				left: 0,
				top: 0,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				userSelect: "none",
				transform: `translateX(${
					(props.x + BOARD_WIDTH / 2) * TILE_WIDTH
				}px) translateY(${
					(BOARD_HEIGHT / 2 - props.y) * TILE_HEIGHT
				}px) translateZ(${1 + (props.dz ?? 0)}px)`,
				transition: "transform 0.2s ease",
				pointerEvents: props.disableInteraction ? "none" : undefined,
				...props.style,
			}}
			onClick={props.onClick}
			onMouseDown={props.onMouseDown}
			onMouseUp={props.onMouseUp}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
			onMouseOver={props.onMouseOver}
		>
			<div style={{ position: "relative" }}>{props.children}</div>
		</div>
	);
};

export default BoardPiece;
