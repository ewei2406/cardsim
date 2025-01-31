export const COLORS = {
	DARKEST: "var(--darkest-color)",
	DARKER: "var(--darker-color)",
	DARK: "var(--dark-color)",
	LIGHT: "var(--light-color)",
	LIGHTER: "var(--lighter-color)",
	LIGHTEST: "var(--lightest-color)",
	PRIMARY: "var(--primary-color)",
	PRIMARY_DARKER: "var(--primary-color-darker)",
	DANGER: "var(--danger-color)",
};

export const hashColor = (id: number): string => {
	const hash = (id * 2654435761) % 360;
	return `hsl(${hash}, 70%, 50%)`;
};
