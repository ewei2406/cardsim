import { TbTrash } from "react-icons/tb";
import BoardPiece from "./BoardPiece";
import { Arrow } from "./Arrow";
import { useDragObserver, getXY } from "@/hooks/useDrag";
import { COLORS } from "@/util/colors";
import { PlayerGroup } from "@/util/GameState";

const DragArrow = ({
	playerGroup,
}: {
	playerGroup: PlayerGroup | undefined;
}) => {
	const { start, end } = useDragObserver();

	if (!playerGroup) return <></>;

	if (start.type === "none" || start.type === "void" || end.type === "none") {
		return <></>;
	}

	if (
		(start.type === "card" || start.type === "deck") &&
		(end.type === "card" || end.type === "deck") &&
		start.id === end.id
	) {
		return <></>;
	}

	const [startX, startY] = getXY(start, playerGroup);
	const [endX, endY] = getXY(end, playerGroup);

	if (end.type === "void") {
		return (
			<>
				<BoardPiece
					x={startX}
					y={startY}
					disableInteraction
					style={{ zIndex: -10000 }}
				>
					<div
						style={{
							display: "flex",
							width: 10,
							height: 10,
							justifyContent: "center",
							alignItems: "center",
							backfaceVisibility: "visible",
							transform: `translateZ(50px) rotateX(-90deg)`,
						}}
					>
						<div
							style={{
								color: COLORS.DANGER,
								fontSize: 40,
							}}
						>
							<TbTrash />
						</div>
					</div>
				</BoardPiece>
			</>
		);
	}

	return <Arrow startX={startX} startY={startY} endX={endX} endY={endY} />;
};

export default DragArrow;
