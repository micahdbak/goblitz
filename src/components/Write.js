import { useRef } from "react";
import { useCookies } from "react-cookie";

import "../styles/Comment.css";
import "../styles/menus.css";

export default function Write(props) {
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
		<div className="comment menu-box">
			<div className="menu-row">
				<textarea ref={commentRef} rows="1" />
				<button className="rounded primary" onClick={comment}>
					Comment
				</button>
			</div>
		</div>
	);
}
