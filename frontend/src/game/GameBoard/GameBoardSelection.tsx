import BoardPiece from "@/game/BoardPieces/BoardPiece";
import { useSelection, selectionObject } from "@/hooks/useSelection";
import { COLORS } from "@/util/colors";
import { TILE_WIDTH } from "@/util/constants";
import { TbArrowBadgeDownFilled } from "react-icons/tb";

const GameBoardSelection = () => {
	const { selection } = useSelection();

	if (selection.type !== "gameBoard") return <></>;

	return (
		<BoardPiece
			x={selection.x}
			y={selection.y}
			onClick={(e) => {
				selectionObject.deselect();
				e.stopPropagation();
			}}
			style={{ zIndex: -10000 }}
		>
			<div
				className="spinning center-content"
				style={{
					width: "100%",
					height: "100%",
					color: COLORS.SELECTION,
					fontSize: TILE_WIDTH * 1.5,
				}}
			>
				<TbArrowBadgeDownFilled />
			</div>
		</BoardPiece>
	);
};

export default GameBoardSelection;
