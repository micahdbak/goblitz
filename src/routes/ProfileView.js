import loadPost from "./View.js";
import React, { useState } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate, useLoaderData } from "react-router-dom";
import "./ProfileView.css"

export async function loadProfiles({ params }) {
        const userres = await fetch("/api/user/" + params.UID);
        const userData = await userres.json();

        return userData;
}

export default function ProfileView(props) {
	const user = useLoaderData();
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
