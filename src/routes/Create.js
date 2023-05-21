import { useCookies } from "react-cookie";

import "../styles/forms.css";
import "../styles/buttons.css";

export default function Create() {
	const [cookies, setCookie, removeCookie] = useCookies(["user_UID, user_Name, user_Image, user_Date"]);
	if (cookies["user_UID"] == null) {
		return (
			<div className="form-container">
				<h1>You must be logged in to create a post.</h1>
			</div>
		);
	} else {
		return (
			<div className="form-container">
				<h1>Create Post</h1>
				<hr />
				<form action="/api/create/post" method="post">
					<input type="hidden" name="UID" value={cookies["user_UID"]} />
					<p>Image:</p>
					<input type="text" name="Image" /><br />
					<p>Title:</p>
					<input type="text" name="Title" /><br />
					<p>Body:</p>
					<textarea name="Text" /><br />
					<button className="btn primary" type="submit">
						Submit
					</button>
				</form>
			</div>
		);
	}
}
