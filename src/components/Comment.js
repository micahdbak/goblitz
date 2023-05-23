import "../styles/Comment.css";

export default function Comment(props) {
	const user = props.user;
	return (
		<div className="comment" id={props.id}>
			<p>{props.Text}</p>
		</div>
	);
}
