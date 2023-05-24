import "../styles/forms.css";
import "../styles/buttons.css";
import "../styles/containers.css";

export default function Register() {
	return (
		<div className="container">
			<div className="form-container">
				<h1>Register</h1>
				<hr />
				<form action="/api/create/user" method="post">
					<p>Username</p>
					<input type="text" name="Link" /><br />
					<p>Password</p>
					<input type="text" name="Pass" /><br />
					<hr />
					<p>Display Name</p>
					<input type="text" name="Name" /><br />
					<p>User Image</p>
					<input type="text" name="Image" /><br />
					<p>User Description</p>
					<textarea name="Text" /><br />
					<button className="btn primary" type="submit">
						Submit
					</button>
				</form>
			</div>
		</div>
	);
}

