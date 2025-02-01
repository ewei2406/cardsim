import useLobby from "./hooks/useLobby";
import DarkMode from "./components/DarkMode";
import Logger from "./components/Logger";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./App.css";
import Lobby from "./components/Lobby";
import Game from "./components/Game";

const App = () => {
	const lobby = useLobby();

	return (
		<div>
			<DarkMode />
			<Logger />
			{lobby.lobbyStatus.status === "lobby" && <Lobby lobby={lobby} />}
			{lobby.lobbyStatus.status !== "lobby" && <Game lobby={lobby} />}
		</div>
	);
};

export default App;
