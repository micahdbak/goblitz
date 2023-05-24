import React, { useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useCookies } from "react-cookie";

import Post from "../components/Post.js";
import Comment from "../components/Comment.js";
import Like from "../components/Like.js";
import MakeComment from "../components/MakeComment.js";

import "../styles/buttons.css";
import "../styles/containers.css";

export async function loadPost({ params }) {
	const post = await fetch("/api/post/" + params.PID);
	const users = await fetch("/api/users");

	let jsonData = {};

	if (post.ok)
		jsonData["post"] = await post.json();
	else
		jsonData["post"] = null;

	if (users.ok)
		jsonData["users"] = await users.json();
	else
		jsonData["users"] = null;

	return jsonData;
}

// access with props.---
// contains test values and comments
export function View(props) {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username"]);
	const jsonData = useLoaderData();
	const post = jsonData["post"];
	const users = jsonData["users"];

	if (post == null || users == null) {
		return (
			<div className="container">
				<p>This post does not exist.</p>
			</div>
		);
	}

	const user = users[parseInt(post["UID"])];

	const [likeCount, setLikeCount] = useState(0);
	const [liked, setLiked] = useState(false);
	const [commenting, setCommenting] = useState(false);

	return (
		<div className="container">
			<Post post={post} users={users} />
			<div class="btn-row">
				<button className="btn primary"
					onClick={() => {setCommenting(!commenting)}}>
					Comment
				</button>
				<button className="btn secondary"
					onClick={() => {location.href = "/"}}>
					Go Back
				</button>
			</div>
			<div className="comment-box">
				{ post["Inters"] != null &&
					post["Inters"].map(i =>
					i["Text"].length > 0 ? (
						<Comment Text={i["Text"]} />
					) : <Like />)
				}
			</div>
			{ commenting && <MakeComment PID={post["PID"]} /> }
		</div>
	);
}
