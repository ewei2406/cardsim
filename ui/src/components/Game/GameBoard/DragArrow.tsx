import { TbTrash } from "react-icons/tb";
import { useDragObserver } from "../../../hooks/useDrag";
import { COLORS } from "../../../util/colors";
import { TILE_SIZE } from "../../../util/constants";
import BoardPiece from "../BoardPieces/BoardPiece";

const DragArrow = () => {
	const { start, end } = useDragObserver();

	if (start.type === "none" || start.type === "void" || end.type === "none") {
		return <></>;
	}

	if (end.type === "void") {
		return (
			<>
				<BoardPiece x={start.x} y={start.y} disableInteraction>
					<div
						style={{
							display: "flex",
							width: 10,
							height: 10,
							justifyContent: "center",
							alignItems: "center",
							transform: "translateZ(50px) rotateX(-90deg)",
						}}
					>
						<div
							className="pulse-border"
							style={{
								color: COLORS.DANGER,
								fontSize: 40,
								border: `2px solid ${COLORS.DANGER}`,
							}}
						>
							<TbTrash />
						</div>
					</div>
				</BoardPiece>
			</>
		);
	}

	const d =
		Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2)) *
		TILE_SIZE;
	const theta = Math.atan2(start.y - end.y, -start.x + end.x);

	const x2 = Math.cos(theta) * (d - TILE_SIZE);
	const y2 = Math.sin(theta) * (d - TILE_SIZE);

	return (
		<BoardPiece x={start.x} y={start.y} disableInteraction>
			<svg
				width={100}
				height={100}
				viewBox="-50 -50 100 100"
				style={{
					overflow: "visible",
					display: "block",
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

export default DragArrow;
