import { ReactNode } from "react";
import { TbX } from "react-icons/tb";
import { COLORS } from "../../util/colors";

const Modal = (props: {
	shown: boolean;
	children: ReactNode;
	title: ReactNode;
	close: () => void;
}) => {
	if (!props.shown) return <></>;

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
			onClick={props.close}
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
					<h2>{props.title}</h2>
					<button
						style={{ backgroundColor: COLORS.DANGER }}
						onClick={props.close}
					>
						<TbX />
					</button>
				</div>
				{props.children}
			</div>
		</div>
	);
};

export default Modal;
