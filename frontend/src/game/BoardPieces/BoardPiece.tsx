import { useTransform } from "@/hooks/useTransformCoords";
import { TILE_WIDTH, TILE_HEIGHT } from "@/util/constants";
import { ReactNode } from "react";

const BoardPiece = (props: {
	x: number;
	y: number;
	transform?: string;
	className?: string;
	rot?: number;
	dz?: number;
	children?: ReactNode;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
	onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
	onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
	disableInteraction?: boolean;
	style?: React.CSSProperties;
}) => {
	const transform = useTransform();

	const [x, y] = transform(props.x, props.y);

	return (
		<div
			className={"board-piece" + (props.className ? ` ${props.className}` : "")}
			style={{
				zIndex: x + y,
				width: TILE_WIDTH,
				height: TILE_HEIGHT,
				transform: `translateX(${x}px) translateY(${y}px) translateZ(${
					props.dz ?? 0
				}px) rotateZ(${props.rot ?? 0}deg) var(--extra-transform) ${
					props.transform ?? ""
				}`,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				pointerEvents: props.disableInteraction ? "none !important" : undefined,
				...props.style,
			}}
			onClick={props.onClick}
			onMouseDown={props.onMouseDown}
			onMouseUp={props.onMouseUp}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
			onMouseOver={props.onMouseOver}
			onDoubleClick={props.onDoubleClick}
		>
			<div style={{ position: "relative" }}>{props.children}</div>
		</div>
	);
};

export default BoardPiece;
