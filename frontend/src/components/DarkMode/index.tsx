import useDarkMode from "@/hooks/useDarkMode";
import { TbMoon, TbSun } from "react-icons/tb";

const DarkMode = () => {
	const { darkMode, toggleDarkMode } = useDarkMode();

	return (
		<button
			onClick={toggleDarkMode}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				zIndex: 1000,
			}}
		>
			{darkMode ? (
				<TbSun style={{ display: "block" }} />
			) : (
				<TbMoon style={{ display: "block" }} />
			)}
		</button>
	);
};

export default DarkMode;
