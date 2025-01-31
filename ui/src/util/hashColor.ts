export const hashColor = (id: number): string => {
	const hash = (id * 2654435761) % 360;
	return `hsl(${hash}, 70%, 80%)`;
};
