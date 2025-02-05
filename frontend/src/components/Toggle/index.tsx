import { COLORS } from "@/util/colors";
import { TbCheck, TbX } from "react-icons/tb";

const Toggle = (props: {
	checked: boolean;
	onChange: (on: boolean) => void;
}) => {
	return (
		<button
			style={{
				backgroundColor: props.checked ? COLORS.PRIMARY : COLORS.LIGHT,
			}}
			onClick={() => props.onChange(!props.checked)}
		>
			{props.checked ? <TbCheck /> : <TbX />}
		</button>
	);
};

export default Toggle;
