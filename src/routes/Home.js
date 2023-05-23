import { useLoaderData } from "react-router-dom";
import { useCallback, useState } from "react";

import Post from "../Post.js";
import "../styles/buttons.css";

export const loadPosts = async () => {
	const posts = await fetch("/api/posts");
	const users = await fetch("/api/users");

	let jsonData = {};

	if (posts.ok) {
		jsonData["posts"] = await posts.json();

		if (jsonData["posts"] != null) {
			jsonData["posts"].sort((a, b) => {
				return a["Mark"] - b["Mark"];
			});
		}
	} else
		jsonData["posts"] = null;

	if (users.ok)
		jsonData["users"] = await users.json();
	else
		jsonData["users"] = null;

	return jsonData;
};

export function Home() {
	const jsonData = useLoaderData();
	if (jsonData["posts"] == null || jsonData["users"] == null) {
		return (
			<div className="post-container">
				<p>No posts created yet. Maybe you have something to share?</p>
			</div>
		);
	}
	const users = jsonData["users"];
	return (
		<div className="post-container">
			{ jsonData["posts"].map(post =>
				<Post clickable={true} post={post} users={users} />
			)}
		</div>
	);
}
