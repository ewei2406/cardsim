import { COLORS } from "@/util/colors";
import { ACTION_FREQ_SPACING_MS } from "@/util/constants";
import { ReactNode, useEffect } from "react";
import { TbX } from "react-icons/tb";

const Modal = ({
	children,
	title,
	close,
}: {
	children: ReactNode;
	title: ReactNode;
	close: () => void;
}) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				close();
			}
			event.stopPropagation();
		};

		document.addEventListener("keydown", handleKeyDown, { capture: true });
		return () => {
			setTimeout(() => {
				document.removeEventListener("keydown", handleKeyDown, {
					capture: true,
				});
			}, ACTION_FREQ_SPACING_MS);
		};
	}, [close]);

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 1000,
				display: "flex",
				alignItems: "center",
				backdropFilter: "blur(5px)",
				WebkitBackdropFilter: "blur(5px)",
				justifyContent: "center",
			}}
			onClick={close}
		>
			<div
				className="card"
				style={{ width: 300 }}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						gap: 5,
						marginBottom: 5,
					}}
				>
					<h2>{title}</h2>
					<button style={{ backgroundColor: COLORS.DANGER }} onClick={close}>
						<TbX />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
};

export default Modal;
