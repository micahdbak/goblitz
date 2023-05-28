import { useLoaderData } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";

import Post from "../components/Post.js";
import "../styles/containers.css";
import "../styles/menus.css";

export const loadPosts = async () => {
	const posts = await fetch("/api/posts");

	let jsonData = {};

	if (posts.ok) {
		jsonData["posts"] = await posts.json();

		if (jsonData["posts"] != null) {
			jsonData["posts"].sort((a, b) => {
				if (a == null || b == null)
					return 0;
				return b["Inters"].length - a["Inters"].length;
			});
		}
	} else
		jsonData["posts"] = null;

	return jsonData;
};

export function Home() {
	const jsonData = useLoaderData();

	if (jsonData["posts"] == [] || jsonData["posts"] == null) {
		return (
			<div className="home-container">
				<p className="external">No posts created yet. Maybe you have something to share?</p>
			</div>
		);
	}

	return (
		<div className="home-container">
			{ jsonData["posts"].map(post => post == null ? <></> :
				<Post clickable={true} post={post} />
			)}
		</div>
	);
}
