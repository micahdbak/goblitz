import { useLoaderData } from "react-router-dom";

import User from "../components/User.js";
import Post from "../components/Post.js";

import "../styles/menus.css";

export async function loadProfile({ params }) {
	let response;
	let json = {};

	try {
		response = await fetch("/api/user/" + params.link);
	} catch {
		return null;
	}

	if (!response.ok)
		return null;

	json["user"] = await response.json();

	try {
		response = await fetch("/api/posts/" + params.link);
	} catch {
		return null;
	}

	if (!response.ok)
		return null;

	json["posts"] = await response.json();

	return json;
}

export default function Profile() {
	const json = useLoaderData();
	const user = json["user"];
	const posts = json["posts"];
	
	if (user == null)
		return (
			<div className="container">
				<h1 className="external">User not found.</h1>
			</div>
		);

	return (
		<div className="container">
			<User user={user} />
			<div className="posts-container">
				{ posts.map(post =>
					<Post post={post} />)
				}
			</div>
		</div>
	);
}
