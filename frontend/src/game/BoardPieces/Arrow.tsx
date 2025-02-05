import { useRot } from "@/hooks/useTransformCoords";
import { COLORS } from "@/util/colors";
import { TILE_WIDTH, TILE_HEIGHT } from "@/util/constants";
import BoardPiece from "./BoardPiece";

export const Arrow = ({
	startX,
	startY,
	endX,
	endY,
}: {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}) => {
	const rot = useRot();

	const d = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
	const theta = Math.atan2(startY - endY, -startX + endX);

	const x2 = Math.cos(theta) * (d - 1) * TILE_WIDTH;
	const y2 = Math.sin(theta) * (d - 1) * TILE_HEIGHT;

	return (
		<BoardPiece x={startX} y={startY} disableInteraction>
			<svg
				width={100}
				height={100}
				viewBox="-50 -50 100 100"
				style={{
					overflow: "visible",
					display: "block",
					transform: `rotateZ(${rot}deg)`,
				}}
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<marker
						id="arrow"
						markerWidth="10"
						markerHeight="10"
						refX="2"
						refY="3"
						orient="auto"
						markerUnits="strokeWidth"
					>
						<path d="M0,1 L0,5 L4,3 Z" fill={COLORS.SELECTION} />
					</marker>
				</defs>

				<line
					x1={0}
					y1={0}
					x2={x2}
					y2={y2}
					stroke={COLORS.SELECTION}
					strokeLinecap="square"
					strokeWidth={10}
					markerEnd="url(#arrow)"
				/>
			</svg>
		</BoardPiece>
	);
};
