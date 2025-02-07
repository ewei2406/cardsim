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
					transform: `translate(-50%, -50%) translateZ(${height}px)`,
				}}
			>
				{count}
			</div>
			<div
				style={{
					position: "absolute",
					color: COLORS.DARKEST,
					fontSize: CARD_WIDTH / 3,
					transform: `translate(-50%, -50%) translateZ(${height}px)`,
				}}
			>
				{count}
			</div>
		</>
	);
};

export default CardCount;
