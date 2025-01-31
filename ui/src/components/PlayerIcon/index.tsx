import { COLORS } from "../../util/colors";
import { hashColor } from "../../util/hashColor";

const PlayerIcon = (props: { id: number }) => {
	const color = hashColor(props.id);
	return (
		<div
			style={{
				backgroundColor: color,
				width: 20,
				height: 20,
				borderRadius: 20,
				border: `1px solid ${COLORS.LIGHTEST}`,
			}}
		></div>
	);
};

export default PlayerIcon;
