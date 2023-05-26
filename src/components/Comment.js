import "../styles/Comment.css";

export default function Comment(props) {
	const comment = props.comment
	return (
		<div className="comment" id={props.id}>
			<p>
				<span className="author">{comment["Display"]}:</span>&nbsp;
				{comment["Text"]}
			</p>
		</div>
	);
}
