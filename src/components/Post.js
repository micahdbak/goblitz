import React, { useState, useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";

import "../styles/Post.css";
import "../styles/buttons.css";

const STAR_TRANSPARENT = "images/star.png";
const STAR_YELLOW = "images/star_yellow.png";

export default function Post(props) {
	const [cookies, setCookie, removeCookie] = useCookies(["session"]);
	const post = props["post"];
	const handleClick = props.clickable ? () => {
		location.href = "/post/" + post["PID"];
	} : () => {};
	const mark = post["Inters"].length;
	const like = async () => {
		let response;

		try {
			const form = new FormData();

			form.append("Session", cookies["session"]);
			form.append("PID", post["PID"]);
			form.append("Text", "🔥"); // a like is just a flame comment

			response = await fetch("/api/create/inter", {
				method: "POST",
				body: form
			});
		} catch {
			return () => {};
		}

		if (response.ok) {
			window.location.reload(false);
		}
	};

	useEffect(() => {
		const updateMark = async () => {
			let post;

			try {
				post = await fetch("/api/post/" + post["PID"]);
			} catch {
				return () => {};
			}

			if (post.ok)
				setMark(post["Inters"].length);
		}

		updateMark();
	}, mark);

	return (
		<div className="post" onClick={handleClick}>
			<div className="img-container">
				<img src={post["Image"]} alt={post["Title"]}/>
			</div>
			<h1 className="title">{post["Title"]}</h1>
			<p className="text">{post["Text"]}</p>
			<h3 className="like" onClick={like}>🔥</h3>
			<h3 className="mark">{mark}</h3>
		</div>
	);
}
