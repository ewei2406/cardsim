import { useCallback, useRef, useState } from "react";
import { useChatHistory } from "../../hooks/useChat";
import { COLORS, hashColor } from "../../util/colors";
import { getHHMM } from "../../util/date";
import { SendMessage } from "../../util/types/ClientRequest";
import { TbSend } from "react-icons/tb";

const ChatHistory = ({ sendMessage }: { sendMessage: SendMessage }) => {
	const messages = useChatHistory();
	const historyRef = useRef<HTMLDivElement | null>(null);
	const [isFocused, setIsFocused] = useState(false);
	const displayedMessages = isFocused ? messages : messages.slice(-5);
	const [chatInput, setChatInput] = useState("");

	const handleSend = useCallback(
		(message: string) => {
			if (message.trim() === "") return;
			sendMessage({
				type: "Command",
				command: "ChatMessage",
				message,
			});
			setChatInput("");
		},
		[sendMessage]
	);

	return (
		<div
			style={{
				width: 300,
				position: "fixed",
				bottom: 0,
				right: 0,
				zIndex: 1000,
			}}
			onMouseEnter={() => setIsFocused(true)}
			onMouseLeave={() => setIsFocused(false)}
		>
			<div
				ref={historyRef}
				style={{
					display: "flex",
					flexDirection: "column",
					paddingBottom: 2,
					overflowY: isFocused ? "scroll" : "hidden",
				}}
			>
				{displayedMessages.map((message) => (
					<div
						key={message.id}
						style={{
							display: "flex",
							justifyContent: "space-between",
							opacity: !isFocused && message.stale ? 0 : 1,
						}}
					>
						<div>
							<span style={{ color: hashColor(message.clientId) }}>
								{message.nickname}:
							</span>{" "}
							{message.message}
						</div>
						<div style={{ color: COLORS.LIGHT }}>{getHHMM(message.date)}</div>
					</div>
				))}
			</div>
			<div style={{ display: "flex" }}>
				<input
					type="text"
					placeholder="Send chat..."
					value={chatInput}
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSend(chatInput);
					}}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					style={{
						width: "100%",
					}}
				/>
				<button onClick={() => handleSend(chatInput)}>
					<TbSend style={{ display: "block" }} />
				</button>
			</div>
		</div>
	);
};

export default ChatHistory;
