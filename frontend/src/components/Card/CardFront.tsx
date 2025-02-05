import { TbJoker } from "react-icons/tb";
import { COLORS } from "../../util/colors";
import {
	BsFillSuitClubFill,
	BsFillSuitDiamondFill,
	BsFillSuitHeartFill,
	BsFillSuitSpadeFill,
	BsSuitClub,
	BsSuitDiamond,
	BsSuitHeart,
	BsSuitSpade,
} from "react-icons/bs";
import { CARD_FACE_PADDING } from "../../util/constants";

const getRank = (rank: number) => {
	switch (rank) {
		case 0:
			return "?";
		case 1:
			return "A";
		case 11:
			return "J";
		case 12:
			return "Q";
		case 13:
			return "K";
		case 14:
			return "";
		case 15:
			return "";
		default:
			return rank;
	}
};

const getSuit = (suit: "H" | "D" | "C" | "S" | "J") => {
	switch (suit) {
		case "H":
			return <BsFillSuitHeartFill />;
		case "D":
			return <BsFillSuitDiamondFill />;
		case "C":
			return <BsFillSuitClubFill />;
		case "S":
			return <BsFillSuitSpadeFill />;
		case "J":
			return <TbJoker style={{ fontSize: "1.4em" }} />;
		default:
			return "";
	}
};

const getSuitBg = (suit: "H" | "D" | "C" | "S" | "J") => {
	switch (suit) {
		case "H":
			return <BsSuitHeart />;
		case "D":
			return <BsSuitDiamond />;
		case "C":
			return <BsSuitClub />;
		case "S":
			return <BsSuitSpade />;
		case "J":
			return <TbJoker />;
		default:
			return "";
	}
};

const getColor = (suit: "H" | "D" | "C" | "S" | "J", rank: number) => {
	switch (suit) {
		case "H":
			return COLORS.DANGER;
		case "D":
			return COLORS.DANGER;
		case "C":
			return COLORS.DARKER;
		case "S":
			return COLORS.DARKER;
		case "J":
			if (rank === 15) {
				return COLORS.DANGER;
			}
			return COLORS.DARKEST;
		default:
			return "";
	}
};

const CardFront = (props: {
	width: number;
	deck_id: number;
	fontSize?: number;
	rank: number;
	suit: "H" | "D" | "C" | "S" | "J";
	selected?: boolean;
	style?: React.CSSProperties;
}) => {
	const displayRank = getRank(props.rank);
	const displaySuit = getSuit(props.suit);
	const bgSuit = getSuitBg(props.suit);
	const color = getColor(props.suit, props.rank);

	return (
		<div
			style={{
				userSelect: "none",
				WebkitUserSelect: "none",
				position: "relative",
				boxSizing: "border-box",
				display: "flex",
				width: props.width,
				height: props.width * 1.5,
				borderRadius: 10,
				padding: 5,
				color: color,
				border: `1px solid ${props.selected ? COLORS.SELECTION : COLORS.LIGHT}`,
				backgroundColor: props.selected ? COLORS.SELECTION : COLORS.LIGHTEST,
				...props.style,
			}}
		>
			<div
				className="column-center"
				style={{
					fontSize: props.fontSize ?? props.width / 4,
					position: "absolute",
					top: CARD_FACE_PADDING,
					left: CARD_FACE_PADDING,
				}}
			>
				{displayRank}
				{displaySuit}
			</div>
			<div
				style={{
					position: "absolute",
					fontSize: props.width / 2.5,
					fontWeight: 800,
					whiteSpace: "nowrap",
					top: "50%",
					right: "50%",
					transform: "translate(50%, -50%)",
					opacity: 0.25,
				}}
			>
				{displayRank}
			</div>
			<div
				style={{
					position: "absolute",
					fontSize: props.width / 1.1,
					whiteSpace: "nowrap",
					top: "50%",
					right: "50%",
					transform: "translate(50%, -40%)",
					opacity: 0.15,
				}}
			>
				{bgSuit}
			</div>

			<div
				className="column-center"
				style={{
					fontSize: props.fontSize ?? props.width / 4,
					position: "absolute",
					bottom: CARD_FACE_PADDING,
					right: CARD_FACE_PADDING,
					transform: "rotateZ(180deg)",
				}}
			>
				{displayRank}
				{displaySuit}
			</div>
		</div>
	);
};

export default CardFront;
