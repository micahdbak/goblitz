import "../styles/forms.css";
import "../styles/buttons.css";

export default function Register() {
	return (
		<div className="form-container">
			<h1>Register</h1>
			<hr />
			<form action="/api/create/user" method="post">
				<p>Link (for use at goblitz/user/<i>link</i>):</p>
				<input type="text" name="Link" /><br />
				<p>Password:</p>
				<input type="text" name="Key" /><br />
				<hr />
				<p>Display Name:</p>
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

