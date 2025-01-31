import { TbSend } from "react-icons/tb";
import { useChat } from "../../hooks/useChat";
import { useCallback, useEffect, useRef, useState } from "react";
import { COLORS, hashColor } from "../../util/colors";
import { getHHMM } from "../../util/date";

const ChatBox = (props: {
	chat: ReturnType<typeof useChat>;
	nicknames: Record<number, string>;
}) => {
	const historyRef = useRef<HTMLDivElement>(null);
	const [chatInput, setChatInput] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const handleSend = useCallback(() => {
		props.chat.sendMessage(chatInput);
		setChatInput("");
	}, [chatInput, props.chat]);

	useEffect(() => {
		if (historyRef.current) {
			historyRef.current.scrollTop = historyRef.current.scrollHeight;
		}
	}, [props.chat.messageHistory, isFocused]);

	return (
		<div
			style={{ width: 300, position: "fixed", bottom: 0, right: 0 }}
			onMouseEnter={() => setIsFocused(true)}
			onMouseLeave={() => setIsFocused(false)}
		>
			<div
				ref={historyRef}
				style={{
					borderTop: `1px solid ${COLORS.LIGHT}`,
					borderLeft: `1px solid ${COLORS.LIGHT}`,
					borderRight: `1px solid ${COLORS.LIGHT}`,
					display: "flex",
					flexDirection: "column",
					gap: 2,
					paddingBottom: 2,
					maxHeight: isFocused ? 200 : 50,
					overflowY: isFocused ? "scroll" : "hidden",
				}}
			>
				{props.chat.messageHistory.map((message, index) => (
					<div
						key={index}
						style={{
							display: "flex",
							justifyContent: "space-between",
							gap: 5,
						}}
					>
						<div>
							<span style={{ color: hashColor(message.clientId) }}>
								{props.nicknames[message.clientId] || "Unknown"}:
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
						if (e.key === "Enter") handleSend();
					}}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					style={{
						width: "100%",
					}}
				/>
				<button onClick={handleSend}>
					<TbSend style={{ display: "block" }} />
				</button>
			</div>
		</div>
	);
};

export default ChatBox;
