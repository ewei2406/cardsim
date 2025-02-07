import UISettings from "./components/UISettings";
import Logger from "./components/Logger";
import Lobby from "./pages/Lobby";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./App.css";

const App = () => {
	return (
		<>
			<UISettings />
			<Logger />
			<Lobby />
		</>
	);
};

export default App;
