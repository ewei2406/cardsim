export const getHHMM = (date: Date) => {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const time = `${hours}:${minutes}`;
	return time;
};
