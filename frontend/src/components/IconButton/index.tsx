import React from "react";
import { IconType } from "react-icons";

const IconButton = ({
	icon,
	onClick,
	children,
}: {
	icon: IconType;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	children?: React.ReactNode;
}) => (
	<button onClick={onClick}>
		{icon({})}
		<div>{children}</div>
	</button>
);
export default IconButton;
