import "../styles/forms.css";
import "../styles/buttons.css";

export default function Register() {
	return (
		<div className="form-container">
			<h1>Register</h1>
			<hr />
			<form action="/api/create/user" method="post">
				<p>User Name:</p>
				<input type="text" name="Name" /><br />
				<p>User Image:</p>
				<input type="text" name="Image" /><br />
				<button className="btn primary" type="submit">
					Submit
				</button>
			</form>
		</div>
	);
}
