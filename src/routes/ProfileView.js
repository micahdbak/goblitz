import loadPost from "./View.js";
import React, { useState } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate, useLoaderData } from "react-router-dom";
import "./ProfileView.css"

export async function loadProfiles({ params }) {
        const user = await fetch("/api/user/" + params.UID);

	let userData;

	if (user.ok)
		userData = await user.json();
	else
		userData = null;

        return userData;
}

export default function ProfileView(props) {
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
		<div className="userDisplay">
			<button className="back-button primary" onClick={() => navigate(-1)}>Go Back</button>
			<div className="userDetailsContainer">
				<img src={user["Image"]} />
				<h1>{user["Name"]}</h1>
			</div>
		</div>
	);
}
