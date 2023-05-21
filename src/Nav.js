import { useState, useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";

import Pro from "./Pro.js";

import "./Nav.css";
import "./buttons.css";

export default function Nav() {
	const [cookies, setCookie, removeCookie] = useCookies(["UID"]);
	const [profileOpen, setProfileOpen] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [registerOpen, setRegisterOpen] = useState(false);
	const userButtons = cookies['UID'] == null ?
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
			<button className="nav-icon">
				<p>+</p>
				<h1>Make Post</h1>
			</button>
			<button className={profileOpen ? "nav-icon-active" : "nav-icon"}
				onClick={() => {setProfileOpen(!profileOpen)}}>
				<p>🤦</p>
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
				<button className="nav-icon">
					<p>🌎</p>
					<h1>Explore</h1>
				</button>
			</div>
			<h1 className="nav-glyptodon">
				Glyptodon
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
