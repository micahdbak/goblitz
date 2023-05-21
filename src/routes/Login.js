import { useCookies } from "react-cookie";
import { useState, useRef } from "react";

import "../styles/forms.css";
import "../styles/buttons.css";

export default function Login() {
	const [cookies, setCookie, removeCookie] = useCookies(["user_UID, user_Name, user_Image, user_Date"]);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [message, setMessage] = useState("");
	const inputRef = useRef(null);
	const submitLogin = async () => {
		const input = inputRef.current.value;

		setIsLoggingIn(true);

		var response;

		try {
			response = await fetch("/api/user/" + input);
		} catch {
			setIsLoggingIn(false);
			setMessage("User does not exist.");

			return;
		}

		const jsonData = await response.json();

		setCookie("user_UID", jsonData["UID"]);
		setCookie("user_Name", jsonData["Name"]);
		setCookie("user_Image", jsonData["Image"]);
		setCookie("user_Date", jsonData["Date"]);

		setIsLoggingIn(false);

		// return to home page
		location.href = "/";
	}
	return (
		<div className="form-container">
			<h1>Login</h1>
			<hr />
			<p>User ID:</p>
			<input ref={inputRef} type="text" /><br />
			<button className="btn primary"
			        onClick={submitLogin}
			        disabled={isLoggingIn}>
				Submit
			</button>
			{ message != "" &&
				<p className="message">{message}</p>
			}
		</div>
	);
}
