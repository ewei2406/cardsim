import { COLORS, hashColor } from "../../util/colors";

// from https://projects.verou.me/css3patterns/#seigaiha
const BG = (color1: string, color2: string) => `
radial-gradient(circle at 100% 150%, ${color1} 24%, ${color2} 24%, ${color2} 28%, ${color1} 28%, ${color1} 36%, ${color2} 36%, ${color2} 40%, transparent 40%, transparent),
radial-gradient(circle at 0    150%, ${color1} 24%, ${color2} 24%, ${color2} 28%, ${color1} 28%, ${color1} 36%, ${color2} 36%, ${color2} 40%, transparent 40%, transparent),
radial-gradient(circle at 50%  100%, ${color2} 10%, ${color1} 10%, ${color1} 23%, ${color2} 23%, ${color2} 30%, ${color1} 30%, ${color1} 43%, ${color2} 43%, ${color2} 50%, ${color1} 50%, ${color1} 63%, ${color2} 63%, ${color2} 71%, transparent 71%, transparent),
radial-gradient(circle at 100% 50%, ${color2} 5%, ${color1} 5%, ${color1} 15%, ${color2} 15%, ${color2} 20%, ${color1} 20%, ${color1} 29%, ${color2} 29%, ${color2} 34%, ${color1} 34%, ${color1} 44%, ${color2} 44%, ${color2} 49%, transparent 49%, transparent),
radial-gradient(circle at 0    50%, ${color2} 5%, ${color1} 5%, ${color1} 15%, ${color2} 15%, ${color2} 20%, ${color1} 20%, ${color1} 29%, ${color2} 29%, ${color2} 34%, ${color1} 34%, ${color1} 44%, ${color2} 44%, ${color2} 49%, transparent 49%, transparent)
`;

const CardBack = (props: {
	width: number;
	deck_id: number;
	selected?: boolean;
}) => {
	const backColor = hashColor(props.deck_id);
	return (
		<div
			style={{
				position: "relative",
				boxSizing: "border-box",
				display: "flex",
				width: props.width,
				height: props.width * 1.5,
				borderRadius: 10,
				border: `1px solid ${props.selected ? COLORS.SELECTION : COLORS.LIGHT}`,
				backgroundColor: props.selected ? COLORS.SELECTION : COLORS.LIGHTEST,
			}}
		>
			<div
				style={{
					flexGrow: 1,
					margin: `${props.width / 7}px`,
					backgroundImage: BG(backColor, COLORS.LIGHTEST),
					backgroundColor: backColor,
					backgroundSize: `${props.width / 2}px ${props.width / 4}px`,
					borderRadius: 5,
				}}
			></div>
		</div>
	);
};

export default CardBack;
