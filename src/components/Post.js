import React, { useState, useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";

import "../styles/Post.css";
import "../styles/menus.css";

const STAR_TRANSPARENT = "images/star.png";
const STAR_YELLOW = "images/star_yellow.png";

export default function Post(props) {
	const [cookies, setCookie, removeCookie] = useCookies(["session"]);
	const post = props["post"];
	const mark = post["Inters"].length;
	const like = async () => {
		if (props.disabled)
			return;

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
			return;
		}

		if (response.ok)
			window.location.reload(false);
	};

	if (props.view)
		return (
			<>
				<div className="view-post">
					<img src={post["Image"]} alt={post["Title"]} />
					<h2 className="mark">{mark}</h2>
					<h2 className="PID">/p/{post["PID"]}</h2>
					<h2 className="like" onClick={like}>🔥</h2>
				</div>
				<div className="view-desc">
					<p>
						<span className="author">{post["Display"]}:</span>&nbsp;
						{post["Text"]}
					</p>
				</div>
			</>
		);
	else
		return (
			<div className="post">
				<img src={post["Image"]} alt={post["Title"]} />
				<h2 className="mark">{mark}</h2>
				{ props.disabled ?
					<h2 className="PID">/p/{post["PID"]}</h2> :
					<a className="PID" href={"/p/" + post["PID"]}>/p/{post["PID"]}</a>
				}
				<div className="desc">
					<h1>{post["Title"]}</h1>
					<p>
						<span className="author">{post["Display"]}:</span>&nbsp;
						{post["Text"]}
					</p>
					<h2 className="like" onClick={like}>🔥</h2>
				</div>
			</div>
		);
}
