import useLobby from "./hooks/useLobby";
import DarkMode from "./components/DarkMode";
import GameSelector from "./components/GameSelector";
import "./App.css";
import Logger from "./components/Logger";

const App = () => {
	const { availableGames, id, refreshGames } = useLobby();

	return (
		<div>
			<DarkMode />
			<Logger />

			<div style={{ maxWidth: 600, margin: "100px auto", padding: "5px 10px" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginBottom: 20,
					}}
				>
					<div>
						<h3>
							Simple Card Simulator{" "}
							<span style={{ color: "var(--light-color)" }}>v1.0.0</span>
						</h3>
						<p style={{ color: "var(--light-color)" }}>Client ID: {id}</p>
					</div>
					<div>
						<button>Create Game</button>
					</div>
				</div>
				<GameSelector
					availableGames={availableGames}
					refreshGames={refreshGames}
				/>
			</div>
		</div>
	);
};

export default App;
