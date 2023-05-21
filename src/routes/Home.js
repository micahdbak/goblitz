import { useLoaderData } from "react-router-dom";
import { useCallback, useState } from "react";

import Post from "../Post.js";
import "../styles/buttons.css";

export const loadPosts = async () => {
	let jsonData = {};

	const posts = await fetch("/api/posts");
	const users = await fetch("/api/users");

	jsonData["posts"] = await posts.json();
	jsonData["users"] = await users.json();

	return jsonData;
};

export function Home() {
	const jsonData = useLoaderData();
	return (
		<div className="post-container">
			{ jsonData["posts"].map(p =>
				<Post PID={p["PID"]}
				      Image={p["Image"]}
				      Title={p["Title"]}
				      Users={jsonData["users"]}
				      UID={p["UID"]}
				      Date={p["Date"]} />
			)}
		</div>
	);
}
