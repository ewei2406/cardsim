import { TbDoorExit } from "react-icons/tb";
import { COLORS } from "../../util/colors";

const LeaveGame = (props: { leaveGame: () => void }) => {
	return (
		<button
			style={{
				backgroundColor: COLORS.DANGER,
				position: "fixed",
				top: 0,
				right: 0,
				zIndex: 1000,
			}}
			onClick={props.leaveGame}
		>
			<TbDoorExit />
			Leave
		</button>
	);
};

export default LeaveGame;
