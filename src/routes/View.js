import React, { useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useCookies } from "react-cookie";

import Post from "../components/Post.js";
import Comment from "../components/Comment.js";
import Write from "../components/Write.js";

import "../styles/containers.css";
import "../styles/menus.css";

export async function loadPost({ params }) {
	const post = await fetch("/api/post/" + params.PID);
	const users = await fetch("/api/users");

	let json = {};

	if (post.ok)
		json["post"] = await post.json();
	else
		json["post"] = null;

	if (users.ok)
		json["users"] = await users.json();
	else
		json["users"] = null;

	return json;
}

// access with props.---
// contains test values and comments
export function View(props) {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username"]);
	const json = useLoaderData();
	const post = json["post"];
	const users = json["users"];

	if (post == null || users == null) {
		return (
			<div className="container">
				<p>This post does not exist.</p>
			</div>
		);
	}

	const user = users[parseInt(post["UID"])];

	return (
		<div className="view-container">
			<div className="view-lcol">
				<Post view={true} post={post} users={users} />
			</div>
			<div className="view-rcol">
				{ post["Inters"] != null &&
					post["Inters"].map(i =>
						<Comment comment={i} />
					)
				}
				<Write PID={post["PID"]} />
			</div>
		</div>
	);
}
