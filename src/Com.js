import "./styles/Com.css";
import "./styles/forms.css";

export default function Com(props) {
	return (
		<div class="com-container">
			<h1>Commenting on #{props.PID}</h1>
			<form action="/api/create/comment" method="post">
				<p>Your Comment:</p>
				<textarea className="resize-none" rows="4" cols="50" name="Text" />
				<input type="hidden" value={props.UID} name="UID" />
				<input type="hidden" value={props.PID} name="PID" />
				<button className="btn primary" type="submit">Submit</button>
			</form>
		</div>
	);
}
