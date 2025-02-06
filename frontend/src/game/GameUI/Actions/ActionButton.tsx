import IconButton from "@/components/IconButton";
import { useEffect, useRef } from "react";
import { IconType } from "react-icons";

export type ActionProps = {
	label: string;
	icon: IconType;
	underlineIndex?: number;
	onClick?: () => void;
	hotKey?: string;
	disabled?: boolean;
	backgroundColor?: string;
	highPriority?: boolean;
};

const getLabelWithUnderline = (label: string, index?: number) => {
	if (index === undefined || index < 0 || index >= label.length) {
		return label;
	}
	return (
		<>
			{label.slice(0, index)}
			<u>{label[index]}</u>
			{label.slice(index + 1)}
		</>
	);
};

const ActionButton = ({
	label,
	underlineIndex,
	icon,
	onClick,
	disabled,
	hotKey,
	backgroundColor,
	highPriority,
}: ActionProps) => {
	const labelWithUnderline = getLabelWithUnderline(label, underlineIndex);
	const disabledRef = useRef(disabled);
	useEffect(() => {
		disabledRef.current = disabled;
	}, [disabled]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === hotKey && !disabledRef.current) {
				onClick?.();
			}
		};
		document.addEventListener("keydown", handleKeyDown, {
			capture: highPriority,
		});
		return () => {
			document.removeEventListener("keydown", handleKeyDown, {
				capture: highPriority,
			});
		};
	}, [highPriority, hotKey, onClick]);

	return (
		<IconButton
			icon={icon}
			onClick={() => onClick?.()}
			disabled={disabled}
			backgroundColor={backgroundColor}
		>
			{labelWithUnderline}
		</IconButton>
	);
};

export default ActionButton;
