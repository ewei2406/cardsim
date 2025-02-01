import { Card } from "../../../hooks/useClient/ServerResponse";

const TableCard = (props: { card: Card; id: number }) => {
	return (
		<div>
			{props.card.deck_id}, {props.card.type}
		</div>
	);
};

export default TableCard;
