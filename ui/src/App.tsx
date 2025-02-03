import DarkMode from "./components/DarkMode";
import Logger from "./components/Logger";
import Lobby from "./components/Lobby";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./App.css";

const App = () => {
	return (
		<>
			<DarkMode />
			<Logger />
			<Lobby />
		</>
	);
};

export default App;
