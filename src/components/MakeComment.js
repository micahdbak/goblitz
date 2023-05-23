import "../styles/MakeComment.css";
import "../styles/forms.css";

export default function MakeComment(props) {
	return (
		<div class="mkcom-container">
			<h1>Commenting on #{props.PID}</h1>
			<form action="/api/create/comment" method="post">
				<textarea className="resize-none" rows="4" cols="50" name="Text" />
				<input type="hidden" value={props.PID} name="PID" />
				<p>UID:</p>
				<input type="password" name="UID" />
				<p>Password:</p>
				<input type="password" name="Key" />
				<p>Your Comment:</p>
				<button className="btn primary" type="submit">Submit</button>
			</form>
		</div>
	);
}
