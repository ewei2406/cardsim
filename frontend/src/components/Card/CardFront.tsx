import { TbJoker } from "react-icons/tb";
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
import { COLORS } from "@/util/colors";
import { CARD_FACE_PADDING } from "@/util/constants";
import CardBase from "./CardBase";

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
	mini?: boolean;
}) => {
	const displayRank = getRank(props.rank);
	const displaySuit = getSuit(props.suit);
	const bgSuit = getSuitBg(props.suit);
	const color = getColor(props.suit, props.rank);

	if (props.mini) {
		return (
			<CardBase
				width={props.width}
				height={props.width}
				selected={props.selected}
				style={props.style}
			>
				<div
					className="row"
					style={{
						fontSize: props.fontSize ?? props.width / 2.5,
						color,
						gap: 1,
						margin: "auto",
					}}
				>
					{displayRank}
					{displaySuit}
				</div>
			</CardBase>
		);
	}

	return (
		<CardBase width={props.width} selected={props.selected} style={props.style}>
			<div
				className="column-center"
				style={{
					fontSize: props.fontSize ?? props.width / 4,
					position: "absolute",
					top: CARD_FACE_PADDING,
					left: CARD_FACE_PADDING,
					color,
				}}
			>
				{displayRank}
				{displaySuit}
			</div>
			<div
				style={{
					position: "absolute",
					fontSize: props.width / 3.2,
					fontWeight: 800,
					whiteSpace: "nowrap",
					top: "50%",
					right: "50%",
					transform: "translate(50%, -50%)",
					opacity: 0.1,
					color,
				}}
			>
				{displayRank}
			</div>
			<div
				style={{
					position: "absolute",
					fontSize: props.width / 1.5,
					whiteSpace: "nowrap",
					top: "50%",
					right: "50%",
					transform: "translate(50%, -40%)",
					opacity: 0.1,
					color,
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
					color,
				}}
			>
				{displayRank}
				{displaySuit}
			</div>
		</CardBase>
	);
};

export default CardFront;
