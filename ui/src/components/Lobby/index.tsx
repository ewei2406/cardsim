import useWs from "../../hooks/useClient/useWs";
import { COLORS } from "../../util/colors";
import GameSelector from "../GameSelector";
import Nickname from "./Nickname";

const Lobby = () => {
	const { wsStatus } = useWs("ws://localhost:8080");

	if (wsStatus.status === "disconnected") {
		return <div>Not Connected!</div>;
	}

	return (
		<div>
			<Nickname />
			<GameSelector />
		</div>
	);
};

export default Lobby;
