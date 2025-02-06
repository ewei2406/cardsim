import { useDrag } from "@/hooks/useDrag";
import { selectionObject } from "@/hooks/useSelection";

const Void = () => {
	const { hoverDrag, finishDrag } = useDrag();

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
				selectionObject.deselect();
				e.stopPropagation();
			}}
			onMouseEnter={(e) => {
				hoverDrag({ type: "void" });
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
