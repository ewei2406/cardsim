import GameSelector from "@/components/GameSelector";
import Game from "@/game/Game";
import { useLobby } from "@/hooks/useLobby";

const Lobby = () => {
	const { lobbyStatus, availableGames, clientId, sendMessage } = useLobby();

	if (!clientId) {
		return <div>Connecting...</div>;
	}

	return (
		<div>
			<div style={{ position: "fixed", top: 0, left: 0, right: 0 }}>
				<div style={{ margin: "0 auto", textAlign: "center" }}>
					<h3>Simple Card Simulator v1.0</h3>
					<p>Client id: {clientId ?? "Unknown"}</p>
				</div>
			</div>

			{lobbyStatus.status === "ingame" ? (
				<Game
					gameState={lobbyStatus.game}
					gameId={lobbyStatus.gameId}
					sendMessage={sendMessage}
					clientId={clientId}
				/>
			) : (
				<GameSelector
					availableGames={availableGames}
					sendMessage={sendMessage}
				/>
			)}
		</div>
	);
};

export default Lobby;
