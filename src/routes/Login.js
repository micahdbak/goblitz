import { useState, useRef } from "react";
import { useCookies } from "react-cookie";

import "../styles/menus.css";
import "../styles/containers.css";

export default function Login() {
	const [cookies, setCookie, removeCookie] = useCookies([
		"userlink", "username", "userimage", "session", "display", "moderator"
	]);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [message, setMessage] = useState("");
	const usernameRef = useRef(null);
	const passwordRef = useRef(null);
	const login = async () => {
		const username = usernameRef.current.value;
		const password = passwordRef.current.value;

		if (username.length == 0 || password.length == 0) {
			setMessage("Fields incomplete.");

			return;
		}

		setIsLoggingIn(true);

		var response;

		try {
			const form = new FormData();

			form.append("Pass", password);

			response = await fetch("/api/login/" + username, {
				method: "POST",
				body: form
			});
		} catch(error) {
			setIsLoggingIn(false);
			setMessage(error.toString());

			return;
		}

		if (!response.ok) {
			setIsLoggingIn(false);
			setMessage(await response.json());

			return;
		}

		const json = await response.json();

		setCookie("userlink", json["Link"]);
		setCookie("username", json["Name"]);
		setCookie("userimage", json["Image"]);
		setCookie("session", json["Session"]);
		setCookie("display", json["Display"]);
		setCookie("moderator", json["Moderator"]);

		setIsLoggingIn(false);

		// return to home page
		location.href = "/";
	};

	return (
		<div className="container">
			<div className="menu-box">
				<h1>Login</h1>
				<hr />
				<p>Username</p>
				<input required ref={usernameRef} type="text" />
				<p>Password</p>
				<input required ref={passwordRef} type="password" />
				<button className="rounded primary"
					onClick={login}
					disabled={isLoggingIn}>
					Login
				</button>
				<div className="menu-sp8" />
				<p className="small">Don't have an account?</p>
				<button className="rounded secondary"
					onClick={() => {location.href="/register"}}>
					Register
				</button>
				{ message != "" &&
					<p className="menu-message">{message}</p>
				}
			</div>
		</div>
	);
}
