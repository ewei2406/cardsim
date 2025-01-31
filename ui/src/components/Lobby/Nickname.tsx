const Nickname = (props: {
	nickname: string;
	setNickname: (nickname: string) => void;
}) => {
	return (
		<div>
			<label>
				Set Nickname:{" "}
				<input
					type="text"
					value={props.nickname}
					onChange={(e) => props.setNickname(e.target.value)}
				/>
			</label>
		</div>
	);
};

export default Nickname;
