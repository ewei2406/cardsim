import { TbDoorExit } from "react-icons/tb";
import { COLORS } from "../../util/colors";

const LeaveGame = (props: { leaveGame: () => void }) => {
	return (
		<button
			style={{
				backgroundColor: COLORS.DANGER,
				position: "fixed",
				display: "flex",
				gap: 5,
				alignItems: "center",
				top: 0,
				right: 0,
			}}
			onClick={props.leaveGame}
		>
			<TbDoorExit style={{ display: "block" }} />
			Leave
		</button>
	);
};

export default LeaveGame;
