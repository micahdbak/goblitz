import { useRef, useState } from "react";
import { useCookies } from "react-cookie";

import Post from "../components/Post.js";

import "../styles/containers.css";
import "../styles/menus.css";

export default function Create() {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username" ]);
	const [post, setPost] = useState({
		"Inters": [],
		"Image": "",
		"Title": "",
		"Text": "",
		"PID": "0",
		"Display": "(Anonymous)"
	});
	const imageRef = useRef(null);
	const titleRef = useRef(null);
	const textRef = useRef(null);
	const updatePreview = () => {
		setPost({
			"Inters": [],
			"Image": imageRef.current.value,
			"Title": titleRef.current.value,
			"Text": textRef.current.value,
			"PID": "0",
			"Display": "(Anonymous)"
		});
	};
	return (
		<div className="view-container">
			<div className="view-lcol">
				<div className="menu-box">
					<h1>Create Post</h1>
					<hr />
					<form action="/api/create/post" method="post">
						<input type="hidden" name="Session" value={cookies["session"]} />
						<p>Image:</p>
						<input ref={imageRef} type="text" name="Image" /><br />
						<p>Title:</p>
						<input ref={titleRef} type="text" name="Title" /><br />
						<p>Body:</p>
						<textarea ref={textRef} name="Text" /><br />
						<button className="rounded primary" disabled={cookies["session"] == null} type="submit">
							Post
						</button>
					</form>
					<hr />
					<button className="rounded secondary" onClick={updatePreview}>
						Update Preview
					</button>
				</div>
			</div>
			<div className="view-rcol">
				<h1 className="external">Preview:</h1>
				<Post disabled={true} post={post} />
			</div>
		</div>
	);
}
