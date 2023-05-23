import "../styles/forms.css";
import "../styles/buttons.css";

export default function Create() {
	return (
		<div className="form-container">
			<h1>Create Post</h1>
			<hr />
			<form action="/api/create/post" method="post">
				<p>UID:</p>
				<input type="password" name="UID" /><br />
				<p>Password:</p>
				<input type="password" name="Key" /><br />
				<hr />
				<p>Image:</p>
				<input type="text" name="Image" /><br />
				<p>Title:</p>
				<input type="text" name="Title" /><br />
				<p>Body:</p>
				<textarea name="Text" /><br />
				<button className="btn primary" type="submit">
					Submit
				</button>
			</form>
		</div>
	);
}
