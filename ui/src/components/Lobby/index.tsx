import useLobby from "../../hooks/useLobby";
import { COLORS } from "../../util/colors";
import GameSelector from "../GameSelector";
import Nickname from "./Nickname";

const Lobby = ({ lobby }: { lobby: ReturnType<typeof useLobby> }) => {
	const {
		id,
		availableGames,
		joinGame,
		refreshGames,
		createGame,
		setNickname,
		nickname,
	} = lobby;
	return (
		<div
			style={{
				maxWidth: 600,
				margin: "100px auto",
				padding: "5px 10px",
				display: "flex",
				gap: 20,
				flexDirection: "column",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<div>
					<h3>
						Simple Card Simulator{" "}
						<span style={{ color: COLORS.LIGHT }}>v1.0.0</span>
					</h3>
					<p style={{ color: COLORS.LIGHT }}>Client ID: {id}</p>
				</div>
			</div>
			<Nickname setNickname={setNickname} nickname={nickname} />
			<GameSelector
				createGame={createGame}
				joinGame={joinGame}
				availableGames={availableGames}
				refreshGames={refreshGames}
			/>
		</div>
	);
};

export default Lobby;
