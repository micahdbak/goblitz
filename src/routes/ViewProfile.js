import React, { useState } from 'react';
import { useNavigate, useLoaderData } from "react-router-dom";

import Post from "../components/Post.js";

import "../styles/ViewProfile.css";
import "../styles/containers.css";

export async function loadProfiles({ params }) {
        const user = await fetch("/api/user/" + params.link);

	let userData;

	if (user.ok)
		userData = await user.json();
	else
		userData = null;

        return userData;
}

export default function ViewProfile(props) {
	const user = useLoaderData();

	if (user == null) {
		return (
			<div className="userDisplay">
				<p>User does not exist.</p>
			</div>
		);
	}

	const navigate = useNavigate();

	return (
		<div className="container">
			<div className="userDisplay">
				<button className="back-button primary" onClick={() => navigate(-1)}>Go Back</button>
				<div className="userDetailsContainer">
					<img src={user["Image"]} />
					<h1>{user["Name"]}</h1>
				</div>
				{ user["Posts"].map(post =>
					<Post post={post} />)
				}
			</div>
		</div>
	);
}
