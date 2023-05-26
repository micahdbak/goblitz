import "../styles/containers.css";
import "../styles/menus.css";

export default function Register() {
	return (
		<div className="container">
			<div className="menu-box">
				<h1>Register</h1>
				<hr />
				<form action="/api/create/user" method="post">
					<p>Username</p>
					<input type="text" name="Link" /><br />
					<p>Password</p>
					<input type="password" name="Pass" /><br />
					<div className="menu-sp8" />
					<p>Display Name</p>
					<input type="text" name="Name" /><br />
					<p>User Image</p>
					<input type="text" name="Image" /><br />
					<p>User Description</p>
					<textarea name="Text" /><br />
					<button className="rounded primary" type="submit">
						Register
					</button>
				</form>
				<div className="menu-sp8" />
				<p className="small">Already have an account?</p>
				<button className="rounded secondary" onClick={() => {location.href = "/login"}}>
					Login
				</button>
			</div>
		</div>
	);
}

