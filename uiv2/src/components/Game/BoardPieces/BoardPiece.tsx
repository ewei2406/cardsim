import { ReactNode } from "react";
import { TILE_HEIGHT, TILE_WIDTH } from "../../../util/constants";
import { useTransform } from "../../../hooks/useTransformCoords";

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
	const transform = useTransform();

	const [x, y] = transform(props.x, props.y);

	return (
		<div
			style={{
				zIndex: x + y,
				position: "absolute",
				width: TILE_WIDTH,
				height: TILE_HEIGHT,
				left: 0,
				top: 0,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				userSelect: "none",
				transform: `translateX(${x}px) translateY(${y}px) translateZ(${
					props.dz ?? 0
				}px)`,
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
