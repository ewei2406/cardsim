import { Fragment } from "react";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../../../util/constants";
import { useSelect } from "../../../hooks/useSelection";
import { useDrag } from "../../../hooks/useDrag";
import BoardPiece from "../BoardPieces/BoardPiece";
import { SendMessage } from "../../../util/types/ClientRequest";
import { COLORS } from "../../../util/colors";
import { useSendMessage } from "../../../context/useSendMessage";

const GBTile = ({
	i,
	j,
}: {
	i: number;
	j: number;
	sendMessage: SendMessage;
}) => {
	const { addSelection } = useSelect();
	const { hoverDrag, finishDrag } = useDrag();
	const x = i - BOARD_WIDTH / 2;
	const y = BOARD_HEIGHT / 2 - j;
	return (
		<BoardPiece
			onClick={(e) => {
				e.stopPropagation();
				addSelection({
					type: "gameBoard",
					x,
					y,
				});
			}}
			onMouseOver={(e) => {
				hoverDrag({
					type: "gameBoard",
					position: { x, y },
				});
				e.stopPropagation();
			}}
			onMouseUp={(e) => {
				if (e.button === 0) {
					e.stopPropagation();
					finishDrag({
						type: "gameBoard",
						position: {
							x,
							y,
						},
					});
				}
			}}
			x={x}
			y={y}
			style={{
				borderRight: `0.5px solid ${COLORS.LIGHTER}`,
				borderBottom: `0.5px solid ${COLORS.LIGHTER}`,
				boxSizing: "border-box",
				zIndex: -10001,
			}}
		></BoardPiece>
	);
};

const X = Array.from({ length: BOARD_WIDTH }, (_, i) => i);
const Y = Array.from({ length: BOARD_HEIGHT }, (_, i) => i);

const GameBoardTiles = () => {
	const sendMessage = useSendMessage();
	return (
		<>
			{X.map((x) => (
				<Fragment key={x}>
					{Y.map((y) => (
						<GBTile key={`${x}-${y}`} i={x} j={y} sendMessage={sendMessage} />
					))}
				</Fragment>
			))}
		</>
	);
};

export default GameBoardTiles;
