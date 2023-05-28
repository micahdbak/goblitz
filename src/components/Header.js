import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import Grow from "./Grow.js";

import "../styles/containers.css";
import "../styles/menus.css";
import "../styles/Header.css";

export default function Header() {
	const [cookies, setCookie, removeCookie] = useCookies([
		"userlink", "username", "userimage", "session", "display", "moderator"
	]);
	const [loaded, setLoaded] = useState(false);
	const [remaining, setRemaining] = useState(0);
	const [watching, setWatching] = useState(0);
	const [winner, setWinner] = useState({ "User": null, "Post": null })
	const load = async () => {
		let response;

		try {
			response = await fetch("/api/blitz");
		} catch {
			// do nothing
		}

		if (response.ok) {
			const json = await response.json();
			setRemaining(parseInt(json));
		}

		try {
			response = await fetch("/api/stats");
		} catch {
			// do nothing
		}

		if (response.ok) {
			const json = await response.json();
			setWatching(parseInt(json["Sessions"]));
		}

		try {
			response = await fetch("/api/winner");
		} catch {
			// do nothing
		}

		if (response.ok) {
			const json = await response.json();
			setWinner(json);
		}
	};
	const logout = async () => {
		removeCookie("userlink");
		removeCookie("username");
		removeCookie("userimage");
		removeCookie("session");
		removeCookie("display");
		removeCookie("moderator");

		const form = new FormData();

		form.append("Session", cookies["session"]);

		let response;

		try {
			response = await fetch("/api/logout", {
				method: "POST",
				body: form
			});
		} catch {
			// do nothing
		}

		setLoaded(false);
		location.href = "/";
	};

	useEffect(() => {
		if (!loaded) {
			load();
			setLoaded(true);
		}

		const interval = setInterval(() => {
			if (remaining > 0)
				setRemaining(remaining - 1);
		}, 1000);

		return () => { clearInterval(interval) };
	}, [remaining, watching]);

	let rbuttons;

	if (cookies["session"] != null)
		rbuttons = (
			<div className="header-group">
				<Grow normal="+" hover="Post" link="/create" />
				<Grow image={cookies["userimage"]} hover={cookies["userlink"]} link={"/u/" + cookies["userlink"]} />
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
					{ remaining > 0 ?
						<button className="grew hot">
							⏰ Blitz in {remaining}s!
						</button> :
						<button className="grew hot">
							Reload Page
						</button>
					}
					<button className="grew">
						👀 {watching} watching
					</button>
					{ winner.User != null && winner.Post != null &&
						<Grow image={winner.User["Image"]}
							hover={"/p/" + winner.Post["PID"]}
							link={"/p/" + winner.Post["PID"]} />
					}
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
