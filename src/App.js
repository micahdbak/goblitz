import { useLoaderData } from "react-router-dom";
import { useCallback, useState } from "react";

import Post from "./Post.js";
import "./buttons.css";

export const loadPosts = async () => {
	var jsonData = {};

	const posts = await fetch("/api/posts");
	const users = await fetch("/api/users");

	jsonData["posts"] = await posts.json();
	jsonData["users"] = await users.json();

	return jsonData;
};

export function App() {
	const jsonData = useLoaderData();

	return (
		<>
			{ jsonData["posts"].map(p =>
				<Post image={p["Image"]}
				      title={p["Title"]}
				      author={p["Author"]}
				      date={p["Date"]} />)
			}
		</>
	);
}
