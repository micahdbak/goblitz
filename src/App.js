import { useLoaderData } from "react-router-dom";
import { useCallback, useState } from "react";

import Post from "./Post.js";
import "./buttons.css";

export const loadPosts = async () => {
	const response = await fetch("/api/posts.json");
	const jsonData = await response.json();

	return jsonData;
};

export function App() {
	const posts = useLoaderData();
	/*
	const [posts, setPosts] = useState(null);
	const doFetch = useCallback(async () => {
		const response = await fetch("/api/posts.json");
		const jsonData = await response.json();

		setPosts(jsonData);
	}); */

	return (
		<>
			{ posts.map(p =>
				<Post image={p["Image"]}
				      title={p["Title"]}
				      author={p["Author"]}
				      date={p["Date"]} />)
			}
		</>
	);
}
