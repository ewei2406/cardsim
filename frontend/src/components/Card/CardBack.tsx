import { hashColor, COLORS } from "@/util/colors";
import CardBase from "./CardBase";

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
	mini?: boolean;
}) => {
	const backColor = hashColor(props.deck_id);
	return (
		<CardBase
			width={props.width}
			selected={props.selected}
			height={props.mini ? props.width : undefined}
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
		</CardBase>
	);
};

export default CardBack;
