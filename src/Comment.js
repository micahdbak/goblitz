import User from "./User.js";

import "./styles/Comment.css";

export default function Comment(props) {
	const user = props.user;
	return (
		<div className="comment" id={props.id}>
			<User user={user} />
			<p>{props.Text}</p>
		</div>
	);
}
