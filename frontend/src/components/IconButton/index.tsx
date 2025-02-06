import React from "react";
import { IconType } from "react-icons";

const IconButton = ({
	icon,
	onClick,
	children,
	disabled,
	backgroundColor,
}: {
	icon: IconType;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	children?: React.ReactNode;
	disabled?: boolean;
	backgroundColor?: string;
}) => (
	<button onClick={onClick} disabled={disabled} style={{ backgroundColor }}>
		{icon({})}
		<div>{children}</div>
	</button>
);
export default IconButton;
