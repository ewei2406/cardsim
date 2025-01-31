import { useLogger } from "../../hooks/useLogger";

const COLOR_MAP = {
	success: "green",
	info: "var(--primary-color)",
	warn: "orange",
	error: "red",
};

const Logger = () => {
	const { logs } = useLogger();

	return (
		<div
			style={{
				position: "fixed",
				bottom: 0,
				right: 0,
			}}
		>
			{logs.map((log, index) => (
				<div
					key={index}
					style={{
						width: 200,
						borderTop: "1px solid var(--lighter-color)",
						borderLeft: "1px solid var(--lighter-color)",
						backgroundColor: "var(--lightest-color)",
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
