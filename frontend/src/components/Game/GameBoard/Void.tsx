import { useDrag } from "../../../hooks/useDrag";
import { useSelect } from "../../../hooks/useSelection";

const Void = () => {
	const { hoverDrag, finishDrag } = useDrag();
	const { deselect } = useSelect();

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
			}}
			onClick={(e) => {
				deselect();
				e.stopPropagation();
			}}
			onMouseEnter={(e) => {
				if (e.buttons === 1) {
					hoverDrag({ type: "void" });
				}
				e.stopPropagation();
			}}
			onMouseUp={(e) => {
				finishDrag({ type: "void" });
				e.stopPropagation();
			}}
		>
			awd
		</div>
	);
};

export default Void;
