import React, { useState, useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";

import Grow from "./Grow.js";

import "../styles/Post.css";
import "../styles/menus.css";

export default function Post(props) {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username", "moderator", "display"]);
	const post = props["post"];
	const mark = post["Inters"].length;
	const deletePost = async () => {
		const form = new FormData();

		form.append("Session", cookies["session"]);

		let response;

		try {
			response = await fetch("/api/delete/" + post["PID"], {
				method: "POST",
				body: form
			});
		} catch {
			return;
		}

		if (response.ok) {
			location.href = "/";
		}
	};
	const deleteButton =
		post["Creator"] == cookies["userlink"] ||
		post["Creator"] == cookies["display"] ||
		cookies["moderator"] == true ?
		<button className="rounded primary"
			disabled={post["Overwrite"] || props.disabled}
			onClick={deletePost}>
			{post["Overwrite"] ? "Deleting..." : "Delete"}
		</button> :
		<></>;

	if (props.view)
		return (
			<>
				<div className="view-post">
					<img src={post["Image"]} alt={post["Title"]} />
					<h2 className="mark">{mark}</h2>
					<h2 className="PID">/p/{post["PID"]}</h2>
					{deleteButton}
				</div>
				<h1 className="view-title">{post["Title"]}</h1>
				<div className="view-desc">
					<p>
						<span className="creator">{post["Creator"]}:</span>&nbsp;
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
				{deleteButton}
				{ props.disabled ?
					<h2 className="PID">/p/{post["PID"]}</h2> :
					<a className="PID" href={"/p/" + post["PID"]}>/p/{post["PID"]}</a>
				}
				<div className="desc">
					<h1>{post["Title"]}</h1>
					<p>
						<span className="author">{post["Creator"]}:</span>&nbsp;
						{post["Text"]}
					</p>
				</div>
			</div>
		);
}
