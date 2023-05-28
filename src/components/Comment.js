import "../styles/Comment.css";

export default function Comment(props) {
	const comment = props.comment
	return (
		<div className={
			comment["Blitz"] == true ?
				"comment comment-blitz" :
				"comment"
			}>
			<p>
				<span className="creator">{comment["Creator"]}:</span>&nbsp;
				{comment["Text"]}
			</p>
		</div>
	);
}
