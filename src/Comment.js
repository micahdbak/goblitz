import "./styles/Comment.css";

export default function Comment(props) {
	return (
		<div className="comment" id={props.id}>
			<p>
				<span className="Name">{props.Name}</span>&nbsp;
				<span className="UID">(UID: {props.UID})</span>&nbsp;
				{props.Text}
			</p>
		</div>
	);
}
