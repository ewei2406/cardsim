import { useSyncExternalStore } from "react";
import { logsStore } from "../../hooks/useLogger";
import { COLORS } from "../../util/colors";

const COLOR_MAP = {
	success: "green",
	info: COLORS.PRIMARY,
	warn: "orange",
	error: "red",
};

const Logger = () => {
	const logs = useSyncExternalStore(logsStore.subscribe, logsStore.getLogs);

	return (
		<div
			style={{
				position: "fixed",
				bottom: 0,
				left: 0,
			}}
		>
			{logs.map((log, index) => (
				<div
					key={index}
					style={{
						width: 200,
						borderTop: `1px solid ${COLORS.LIGHTER}`,
						borderRight: `1px solid ${COLORS.LIGHTER}`,
						backgroundColor: COLORS.LIGHTEST,
						fontSize: "0.9em",
						color: COLOR_MAP[log.severity],
					}}
				>
					{log.message}
				</div>
			))}
		</div>
	);
};

export default Logger;
