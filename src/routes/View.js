import React, { useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useCookies } from "react-cookie";

import Post from "../Post.js";
import Comment from "../Comment.js";
import Com from "../Com.js";

import "../styles/buttons.css";
import "../styles/View.css";

const STAR_TRANSPARENT = "/images/star.png";
const STAR_YELLOW = "/images/star_yellow.png";

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
	const jsonData = useLoaderData();
	const post = jsonData["post"];
	const users = jsonData["users"];

	if (post == null || users == null) {
		return (
			<div className="post-container">
				<p>This post does not exist.</p>
			</div>
		);
	}

	const user = users[parseInt(post["UID"])];

	const [cookies, setCookie, removeCookie] = useCookies(["user_UID", "user_Image", "user_Name"]);
	const [likeCount, setLikeCount] = useState(0);
	const [liked, setLiked] = useState(false);
	const [commenting, setCommenting] = useState(false);

	const clickLikeButton = () => {
		if (liked) {
			setLikeCount(likeCount - 1);
		} else {
			setLikeCount(likeCount + 1);
		}
		setLiked(!liked);
	};

	return (
		<div className="view-container">
			<Post post={post} users={users} />
			<div className="space-between">
				<h3>{likeCount} like{likeCount == 1 ? "" : "s"}</h3>
				<div class="btn-row">
					<button className="btn icon-24px primary"
					        onClick={clickLikeButton}>
						<img src={liked ? STAR_YELLOW : STAR_TRANSPARENT} alt="Like Button" />
					</button>
					<button className="btn icon-24px secondary">
						<img src="/images/download.png" alt="" />
					</button>
				</div>
			</div>
			<div class="btn-row">
				<button className="btn primary"
				        disabled={cookies["user_UID"] == null}
					onClick={() => {setCommenting(!commenting)}}>
					Comment
				</button>
				<button className="btn secondary"
					onClick={() => {location.href = "/"}}>
					Go Back
				</button>
			</div>
			<div className="comment-box">
				{ post["Comments"] != null &&
					post["Comments"].map(c =>
					<Comment user={users[parseInt(c["UID"])]}
					         Text={c["Text"]}
					         id={c["CID"]}/>)
				}
			</div>
			{ commenting && <Com UID={cookies["user_UID"]} PID={post["PID"]} /> }
		</div>
	);
}
