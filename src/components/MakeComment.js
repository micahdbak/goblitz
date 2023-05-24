import { useRef } from "react";
import { useCookies } from "react-cookie";

import "../styles/MakeComment.css";
import "../styles/forms.css";

export default function MakeComment(props) {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username"]);
	const commentRef = useRef(null);
	const comment = async () => {
		const form = new FormData();

		form.append("Session", cookies["session"]);
		form.append("PID", props.PID);
		form.append("Text", commentRef.current.value);

		let response;

		try {
			response = await fetch("/api/create/inter", {
				method: "POST",
				body: form
			});
		} catch {
			// lol
		}

		if (response.ok)
			window.location.reload(false);
	};

	return (
		<div class="mkcom-container">
			<h1>Commenting on #{props.PID}</h1>
			<p>Comment</p>
			<textarea ref={commentRef} className="resize-none" rows="4" cols="50" name="Text" />
			<button className="btn primary" onClick={comment}>Submit</button>
		</div>
	);
}
