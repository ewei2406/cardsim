import CardBack from "@/components/Card/CardBack";
import CardFront from "@/components/Card/CardFront";
import { CARD_WIDTH } from "@/util/constants";
import { Card } from "@/util/types/ServerResponse";
import BoardPiece from "../BoardPiece";

export type TableCardProps = {
	tableCard: Card;
	id: number;
	transform?: string;
	className?: string;
	selected?: boolean;
	hovered?: boolean;
	x: number;
	y: number;
	rot?: number;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
	onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
	onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
	disableInteraction?: boolean;
	style?: React.CSSProperties;
	mini?: boolean;
};

const TableCard = (props: TableCardProps) => {
	return (
		<BoardPiece {...props} dz={props.hovered ? 5 : 0} key={props.id}>
			<div
				key={props.id}
				style={{
					position: "absolute",
					transform: `translate(-50%, -50%) rotateY(${
						props.tableCard.type === "Hidden" ? 360 : 180
					}deg)`,
					transition: "transform 0.75s ease",
					backfaceVisibility: "hidden",
				}}
			>
				<CardBack
					width={CARD_WIDTH}
					deck_id={props.tableCard.deck_id}
					selected={props.selected}
					mini={props.mini}
				/>
			</div>
			<div
				style={{
					position: "absolute",
					transform: `translate(-50%, -50%) rotateY(${
						props.tableCard.type === "Hidden" ? 180 : 0
					}deg)`,
					transition: "transform 0.75s ease",
					backfaceVisibility: "hidden",
				}}
			>
				<CardFront
					width={CARD_WIDTH}
					deck_id={props.tableCard.deck_id}
					rank={props.tableCard.type === "Hidden" ? 0 : props.tableCard.rank}
					suit={props.tableCard.type === "Hidden" ? "S" : props.tableCard.suit}
					selected={props.selected}
					mini={props.mini}
				/>
			</div>
		</BoardPiece>
	);
};

export default TableCard;
