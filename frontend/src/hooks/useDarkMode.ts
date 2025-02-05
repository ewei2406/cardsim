import { useState, useEffect } from "react";

const useDarkMode = () => {
	const [darkMode, setDarkMode] = useState(() => {
		const savedMode = localStorage.getItem("darkMode");
		return savedMode ? !!JSON.parse(savedMode) : false;
	});

	useEffect(() => {
		const prefersDarkMode = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;
		setDarkMode((prevMode) => {
			const initialMode = prevMode ?? prefersDarkMode;
			localStorage.setItem("darkMode", JSON.stringify(initialMode));
			return initialMode;
		});
	}, []);

	useEffect(() => {
		document.body.className = darkMode ? "theme-dark" : "theme-light";
		localStorage.setItem("darkMode", JSON.stringify(darkMode));
	}, [darkMode]);

	const toggleDarkMode = () => {
		setDarkMode((prevMode) => !prevMode);
	};

	return { darkMode, toggleDarkMode };
};

export default useDarkMode;
