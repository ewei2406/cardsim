import { useCallback, useEffect, useState } from "react";
import useLobby from "./useLobby";
import { HandleChatMessage } from "./useClient/ServerResponse";

export const useChat = (
	onChatMessage: ReturnType<typeof useLobby>["onChatMessage"],
	sendChatMessage: ReturnType<typeof useLobby>["sendChatMessage"]
) => {
	const [messageHistory, setMessageHistory] = useState<
		{
			date: Date;
			clientId: number;
			message: string;
		}[]
	>([]);

	const handleChatMessage: HandleChatMessage = useCallback((message) => {
		setMessageHistory((prev) => [
			...prev,
			{
				date: new Date(),
				clientId: message.client_id,
				message: message.message,
			},
		]);
		return { variant: "ok", value: undefined };
	}, []);

	useEffect(() => {
		onChatMessage(handleChatMessage);
	}, [onChatMessage, handleChatMessage]);

	const sendMessage = useCallback(
		(message: string) => {
			sendChatMessage(message);
		},
		[sendChatMessage]
	);

	return {
		messageHistory,
		sendMessage,
	};
};
