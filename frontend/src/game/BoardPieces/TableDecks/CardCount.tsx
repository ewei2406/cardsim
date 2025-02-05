import { COLORS } from "@/util/colors";
import { CARD_WIDTH } from "@/util/constants";

const CardCount = ({ count, height }: { count: number; height: number }) => {
	return (
		<>
			<div
				style={{
					position: "absolute",
					WebkitTextStroke: `5px ${COLORS.LIGHTEST}`,
					fontSize: CARD_WIDTH / 3,
					transform: `translate(-50%, -50%) translateZ(${height}px) translateY(-${
						CARD_WIDTH / 3
					}px)`,
				}}
			>
				{count}
			</div>
			<div
				style={{
					position: "absolute",
					color: COLORS.DARKEST,
					fontSize: CARD_WIDTH / 3,
					transform: `translate(-50%, -50%) translateZ(${height}px) translateY(-${
						CARD_WIDTH / 3
					}px)`,
				}}
			>
				{count}
			</div>

			{/* Other side of card count */}
			<div
				style={{
					position: "absolute",
					WebkitTextStroke: `5px ${COLORS.LIGHTEST}`,
					fontSize: CARD_WIDTH / 3,
					transform: `translate(-50%, -50%) translateZ(${height}px) translateY(${
						CARD_WIDTH / 3
					}px) rotate(180deg)`,
				}}
			>
				{count}
			</div>
			<div
				style={{
					position: "absolute",
					color: COLORS.DARKEST,
					fontSize: CARD_WIDTH / 3,
					transform: `translate(-50%, -50%) translateZ(${height}px) translateY(${
						CARD_WIDTH / 3
					}px) rotate(180deg)`,
				}}
			>
				{count}
			</div>
		</>
	);
};

export default CardCount;
