import { TbDoorExit } from "react-icons/tb";
import { COLORS } from "../../util/colors";
import { SendMessage } from "../../util/types/ClientRequest";
import { selectionObject } from "../../hooks/useSelection";

const LeaveGame = ({ sendMessage }: { sendMessage: SendMessage }) => {
	const leaveGame = () => {
		sendMessage({
			type: "Command",
			command: "LeaveGame",
		});
		selectionObject.deselect();
	};

	return (
		<button
			style={{
				backgroundColor: COLORS.DANGER,
				position: "fixed",
				top: 0,
				right: 0,
				zIndex: 1000,
			}}
			onClick={leaveGame}
		>
			<TbDoorExit />
			Leave
		</button>
	);
};

export default LeaveGame;
