import React, { useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useCookies } from "react-cookie";

import Comment from "../Comment.js";
import Com from "../Com.js";

import "../styles/buttons.css";
import "../styles/Post.css";

const STAR_TRANSPARENT = "/images/star.png";
const STAR_YELLOW = "/images/star_yellow.png";

export async function loadPost({ params }) {
	const postres = await fetch("/api/post/" + params.PID);
	const postData = await postres.json();

	const userres = await fetch("/api/users");
	const userData = await userres.json();

	let jsonData = {};

	jsonData["post"] = postData;
	jsonData["users"] = userData;

	return jsonData;
}

// access with props.---
// contains test values and comments
export function View(props) {
	const jsonData = useLoaderData();
	const post = jsonData["post"];
	const user = jsonData["users"][parseInt(jsonData["post"]["UID"])];
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
	if (post == null || user == null) {
		return <p>This post does not exist.</p>
	}
	return (
		<div className="post-large-container">
			<img src={post["Image"]}/>
			<div className="space-between">
				<h1>{post["Title"]}</h1>
				<h2>
					{user["Name"]} <span className="UID">(UID: {post["UID"]})</span>,&nbsp;
					{post["Date"]}
				</h2>
			</div>
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
			<hr />
			<h3>Description:</h3>
			<p>{post["Text"]}</p>
			<hr />
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
				{ post["Comments"] != null && post["Comments"].map(c =>
					<Comment Image={jsonData["users"][parseInt(c["UID"])]["Image"]}
					         Name={jsonData["users"][parseInt(c["UID"])]["Name"]}
					         Text={c["Text"]}
					         UID={c["UID"]}
					         id={c["CID"]}/>)
				}
			</div>
			{ commenting && <Com UID={cookies["user_UID"]} PID={post["PID"]} /> }
		</div>
	);
}
