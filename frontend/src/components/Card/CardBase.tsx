import { COLORS } from "@/util/colors";
import { CSSProperties, ReactNode } from "react";

const CardBase = ({
	children,
	style,
	width,
	height,
	selected,
}: {
	children: ReactNode;
	width: number;
	height?: number;
	style?: CSSProperties;
	selected?: boolean;
}) => {
	return (
		<div
			style={{
				userSelect: "none",
				WebkitUserSelect: "none",
				position: "relative",
				boxSizing: "border-box",
				display: "flex",
				width: width,
				height: height ?? width * 1.5,
				borderRadius: 10,
				border: `1px solid ${selected ? COLORS.SELECTION : COLORS.LIGHTER}`,
				backgroundColor: selected ? COLORS.SELECTION : COLORS.LIGHTEST,
				...style,
			}}
		>
			{children}
		</div>
	);
};

export default CardBase;
