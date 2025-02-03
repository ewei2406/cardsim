import { TbArrowBadgeDownFilled } from "react-icons/tb";
import { COLORS } from "../../../util/colors";
import {
	BOARD_HEIGHT,
	BOARD_WIDTH,
	TILE_HEIGHT,
	TILE_WIDTH,
} from "../../../util/constants";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./GameBoardSelection.css";
import { useSelection } from "../../../hooks/useSelection";

const GameBoardSelection = () => {
	const { selection } = useSelection();

	if (selection.type !== "gameBoard") return <></>;

	return (
		<div
			style={{
				position: "absolute",
				left: (selection.x + BOARD_WIDTH / 2) * TILE_WIDTH,
				top: (BOARD_HEIGHT / 2 - selection.y) * TILE_HEIGHT,
				width: TILE_WIDTH,
				boxSizing: "border-box",
				height: TILE_HEIGHT,
				pointerEvents: "none",
			}}
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
		</div>
	);
};

export default GameBoardSelection;
