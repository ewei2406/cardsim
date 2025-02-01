import { TbArrowBadgeDownFilled } from "react-icons/tb";
import { useSelection } from "../../../hooks/useSelection";
import { COLORS } from "../../../util/colors";
import { BOARD_HEIGHT, BOARD_WIDTH, TILE_SIZE } from "../../../util/constants";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./GameBoardSelection.css";

const GameBoardSelection = () => {
	const { selection } = useSelection();

	if (selection.type !== "gameBoard") return <></>;

	return (
		<div
			style={{
				position: "absolute",
				left: (selection.x + BOARD_WIDTH / 2) * TILE_SIZE - TILE_SIZE / 2,
				top: (BOARD_HEIGHT / 2 - selection.y) * TILE_SIZE - TILE_SIZE / 2,
				width: TILE_SIZE * 2,
				borderRadius: TILE_SIZE * 2,
				boxSizing: "border-box",
				height: TILE_SIZE * 2,
				border: `2px solid ${COLORS.SELECTION}`,
				pointerEvents: "none",
			}}
		>
			<div
				className="spinning"
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: COLORS.SELECTION,
					fontSize: TILE_SIZE * 1.5,
				}}
			>
				<TbArrowBadgeDownFilled />
			</div>
		</div>
	);
};

export default GameBoardSelection;
