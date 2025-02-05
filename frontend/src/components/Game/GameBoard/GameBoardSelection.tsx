import { TbArrowBadgeDownFilled } from "react-icons/tb";
import { COLORS } from "../../../util/colors";
import { TILE_WIDTH } from "../../../util/constants";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./GameBoardSelection.css";
import { useSelection } from "../../../hooks/useSelection";
import BoardPiece from "../BoardPieces/BoardPiece";

const GameBoardSelection = () => {
	const { selection } = useSelection();

	if (selection.type !== "gameBoard") return <></>;

	return (
		<BoardPiece
			x={selection.x}
			y={selection.y}
			disableInteraction
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
