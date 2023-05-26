import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import Grow from "./Grow.js";

import "../styles/containers.css";
import "../styles/menus.css";
import "../styles/Header.css";

export default function Header() {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username", "userimage"]);
	const [loaded, setLoaded] = useState(false);
	const [remaining, setRemaining] = useState(0);
	const [watching, setWatching] = useState(0);

	const load = async () => {
		let response;

		try {
			response = await fetch("/api/blitz");
		} catch {
			return;
		}

		if (response.ok) {
			const json = await response.json();
			setRemaining(parseInt(json));
		}

		try {
			response = await fetch("/api/stats");
		} catch {
			return;
		}

		if (response.ok) {
			const json = await response.json();
			setWatching(parseInt(json["Sessions"]));
		}
	};

	useEffect(() => {
		if (!loaded) {
			load();
			setLoaded(true);
		}

		const interval = setInterval(() => {
			setRemaining(remaining - 1);

			if (remaining < 0)
				setRemaining(120);
		}, 1000);

		return () => { clearInterval(interval) };
	}, [remaining, watching]);

	const logout = async () => {
		const form = new FormData();

		form.append("Session", cookies["session"]);

		let response;

		try {
			response = await fetch("/api/logout/" + cookies["username"], {
				method: "POST",
				body: form
			});
		} catch {
			return;
		}

		if (response.ok) {
			removeCookie("session");
			removeCookie("username");
			removeCookie("userimage");

			location.reload(false);
		}
	};

	let rbuttons;

	if (cookies["session"] != null)
		rbuttons = (
			<div className="header-group">
				<Grow normal="+" hover="Post" link="/create" />
				<Grow image={true} normal={cookies["userimage"]} hover={cookies["username"]} link={"/user/" + cookies["username"]} />
				<Grow normal="👋" hover="Logout" click={logout} />
			</div>
		);
	else
		rbuttons = (
			<div className="header-group">
				<Grow normal="🔐" hover="Login" link="/login" />
				<Grow normal="✨" hover="Register" link="/register" />
			</div>
		);

	return (
		<>
			<div className="header-container">
				<div className="header-group">
					<Grow normal="🏠" hover="Home" link="/" />
					<button className="grew hot">
						<span className="red">⏰ Blitz in {remaining}s!</span>
					</button>
					<button className="grew">
						👀 {watching} watching
					</button>
				</div>
				<div className="header-center">
					<h1 className="goblitz">goblitz.net</h1>
				</div>
				{rbuttons}
			</div>
			<div className="blitz-container">
				<p className="blitz">
					<u>goblitz.net</u> is currently in beta;&nbsp;
					if you'd like to help, check out our <a href="https://github.com/micahdbak/goblitz">GitHub</a>!
				</p>
			</div>
		</>
	);
}
