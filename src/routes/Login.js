import { useState, useRef } from "react";
import { useCookies } from "react-cookie";

import "../styles/forms.css";
import "../styles/buttons.css";
import "../styles/containers.css";

export default function Login() {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username"]);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [message, setMessage] = useState("");
	const usernameRef = useRef(null);
	const passwordRef = useRef(null);
	const submitLogin = async () => {
		const username = usernameRef.current.value;
		const password = passwordRef.current.value;

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
			setMessage(error);

			return;
		}

		if (response.ok) {
			const session = await response.json();

			setCookie("session", session);
			setCookie("username", username);
		} else {
			const error = await response.json();

			setMessage(error);
		}

		setIsLoggingIn(false);

		// return to home page
		location.href = "/";
	}
	return (
		<div className="container">
			<div className="form-container">
				<h1>Login</h1>
				<hr />
				<p>Username</p>
				<input ref={usernameRef} type="text" /><br />
				<p>Password</p>
				<input ref={passwordRef} type="password" /><br />
				<button className="btn primary"
					onClick={submitLogin}
					disabled={isLoggingIn}>
					Submit
				</button>
				{ message != "" &&
					<p className="message">{message}</p>
				}
			</div>
		</div>
	);
}
