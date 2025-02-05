import { SendMessage } from "@/util/types/ClientRequest";
import { createContext, useContext } from "react";

interface SendMessageContextProps {
	sendMessage: SendMessage;
}

export const SendMessageContext = createContext<
	SendMessageContextProps | undefined
>(undefined);

export const useSendMessage = () => {
	const context = useContext(SendMessageContext);
	if (!context) {
		throw new Error("useSendMessage must be used within a SendMessageProvider");
	}
	return context.sendMessage;
};
