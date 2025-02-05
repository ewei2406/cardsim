import { TbDoorExit } from "react-icons/tb";
import { COLORS } from "../../../util/colors";
import { selectionObject } from "../../../hooks/useSelection";
import { useSendMessage } from "../../../context/useSendMessage";

const LeaveGame = () => {
	const sendMessage = useSendMessage();
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
