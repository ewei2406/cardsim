import useDarkMode from "@/hooks/useDarkMode";
import { uiSettingsObject, useUISettings } from "@/hooks/useUISettings";
import { TbMoon, TbResize, TbSquare, TbSun } from "react-icons/tb";

const UISettings = () => {
	const { darkMode, toggleDarkMode } = useDarkMode();
	const { miniTableCards } = useUISettings();

	return (
		<div
			style={{
				position: "fixed",
				display: "flex",
				top: 0,
				left: 0,
				zIndex: 1000,
			}}
		>
			<button onClick={toggleDarkMode}>
				{darkMode ? <TbSun /> : <TbMoon />}
			</button>
			<button
				onClick={() => {
					uiSettingsObject.setMiniTableCards(!miniTableCards);
				}}
			>
				{miniTableCards ? <TbSquare /> : <TbResize />}
			</button>
		</div>
	);
};

export default UISettings;
