import { useState, useRef } from "react";
import { useCookies } from "react-cookie";

import "../styles/menus.css";
import "../styles/containers.css";

export default function Login() {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username", "userimage"]);
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
			let user_response;

			try {
				user_response = await fetch("/api/user/" + username);
			} catch {
				return;
			}

			const user = await user_response.json();
			const session = await response.json();

			setCookie("session", session);
			setCookie("username", username);
			setCookie("userimage", user["Image"]);
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
			<div className="menu-box">
				<h1>Login</h1>
				<hr />
				<p>Username</p>
				<input ref={usernameRef} type="text" />
				<p>Password</p>
				<input ref={passwordRef} type="password" />
				<button className="rounded primary"
					onClick={submitLogin}
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
