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

	let json = {};

	if (post.ok)
		json["post"] = await post.json();
	else
		json["post"] = null;

	return json;
}

// access with props.---
// contains test values and comments
export function View(props) {
	const [cookies, setCookie, removeCookie] = useCookies(["session"]);
	const json = useLoaderData();
	const post = json["post"];

	if (post == null) {
		return (
			<div className="container">
				<h1 className="external">This post does not exist.</h1>
			</div>
		);
	}

	return (
		<div className="view-container">
			<div className="view-lcol">
				<Post view={true} post={post} />
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
