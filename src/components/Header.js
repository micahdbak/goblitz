import { useState, useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";

import "../styles/Header.css";
import "../styles/buttons.css";

export default function Header() {
	const [cookies, setCookie, removeCookie] = useCookies(["session", "username"]);
	const [profileOpen, setProfileOpen] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [registerOpen, setRegisterOpen] = useState(false);
	const [remaining, setRemaining] = useState(0);
	const [didLoad, setDidLoad] = useState(false);
	const [watchers, setWatchers] = useState(0);

	const callBlitz = async () => {
		let blitz;

		try {
			blitz = await fetch("/api/blitz");
		} catch {
			return;
		}

		if (blitz.ok) {
			const _remaining = await blitz.json();

			setRemaining(_remaining);
		}
	};
	const callStats = async () => {
		let stats;

		try {
			stats = await fetch("/api/stats");
		} catch {
			return;
		}

		if (stats.ok) {
			const statsData = await stats.json();

			setWatchers(statsData["Sessions"]);
		}
	}

	useEffect(() => {
		if (!didLoad) {
			callBlitz();
			callStats();

			setDidLoad(true);
		} else {
			const interval = setInterval(() => {
				if (remaining > 0)
					setRemaining(remaining - 1);
				else
					// refresh page once counter hits zero
					window.location.reload(false);
			}, 1000);
			return () => clearInterval(interval);
		}
	});

	const menu = cookies["session"] == null ? (
		<>
			<button className="header-icon" onClick={() => {location.href="/login"}}>
				<p>🔐</p>
				<h1>Login</h1>
			</button>
			<button className="header-icon" onClick={() => {location.href="/register"}}>
				<p>✨</p>
				<h1>Register</h1>
			</button>
			<button className="header-icon">
				<p>🌙</p>
				<h1>Theme</h1>
			</button>
		</>
	) : (
		<>
			<button className="header-icon" onClick={() => {location.href="/create"}}>
				<p>+</p>
				<h1>Make Post</h1>
			</button>
			<button className="header-icon">
				<p>:)</p>
				<h1>{cookies["username"]}</h1>
			</button>
			<button className="header-icon" onClick={() => {location.href="/logout"}}>
				<p>🚶</p>
				<h1>Logout</h1>
			</button>
		</>
	)

	return (
		<>
			<div className="header-container">
				<div className="header-group">
					<button className="header-icon" onClick={() => {location.href="/"}}>
						<p>🏠</p>
						<h1>Home</h1>
					</button>
				</div>
				<div className="header-group-center">
					<h1 className="header-goblitz">
						goblitz.net
					</h1>
				</div>
				<div className="header-group">
					{menu}
				</div>
				{ profileOpen && <Pro /> }
			</div>
			<div className="stats-container">
				<h1>
					<span className="larger">
						Blitz in {remaining}s;&nbsp;
						<i>{watchers} watching.</i>
					</span>&nbsp;&mdash;
					goblitz.net is currently in BETA;
					if you are interested in helping,
					please check out our&nbsp;
					<a href="https://github.com/micahdbak/goblitz">
						GitHub
					</a>.
				</h1>
			</div>
		</>
	);
}
