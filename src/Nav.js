import { useState, useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";

import Pro from "./Pro.js";

import "./styles/Nav.css";
import "./styles/buttons.css";

export default function Nav() {
	const [cookies, setCookie, removeCookie] = useCookies(["user_UID", "user_Image", "user_Name"]);
	const [profileOpen, setProfileOpen] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [registerOpen, setRegisterOpen] = useState(false);
	const userButtons = cookies["user_UID"] == null ?
		(<>
			<button className="nav-icon" onClick={() => {location.href="/login"}}>
				<p>🔐</p>
				<h1>Login</h1>
			</button>
			<button className="nav-icon" onClick={() => {location.href="/register"}}>
				<p>✨</p>
				<h1>Register</h1>
			</button>
		</>) :
		(<>
			<button className="nav-icon" onClick={() => {location.href="/create"}}>
				<p>+</p>
				<h1>Make Post</h1>
			</button>
			<button className={profileOpen ? "nav-icon-active" : "nav-icon"}
				onClick={() => {setProfileOpen(!profileOpen)}}>
				<img src={cookies["user_Image"]} alt={cookies["user_Name"]} />
				<h1>Profile</h1>
			</button>
		</>);
	return (
		<div className="nav-container-fixed">
			<div className="nav-group">
				<button className="nav-icon" onClick={() => {location.href="/"}}>
					<p>🏠</p>
					<h1>Home</h1>
				</button>
			</div>
			<h1 className="nav-goblitz">
				goblitz.net
			</h1>
			<div className="nav-group">
				{userButtons}
			</div>
			{ profileOpen &&
				<Pro />
			}
		</div>
	);
}
