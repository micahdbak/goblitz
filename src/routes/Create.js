import { useCookies } from "react-cookie";

import "../styles/forms.css";
import "../styles/buttons.css";
import "../styles/containers.css";

export default function Create() {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username"]);
	return (
		<div className="container">
			<div className="form-container">
				<h1>Create Post</h1>
				<hr />
				<form action="/api/create/post" method="post">
					<input type="hidden" name="Session" value={cookies["session"]} />
					<p>Image:</p>
					<input type="text" name="Image" /><br />
					<p>Title:</p>
					<input type="text" name="Title" /><br />
					<p>Body:</p>
					<textarea name="Text" /><br />
					<button className="btn primary" disabled={cookies["session"] == null} type="submit">
						Submit
					</button>
				</form>
			</div>
		</div>
	);
}
