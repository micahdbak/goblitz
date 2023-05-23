import { useState, useCallback, useEffect } from "react";

import "../styles/Header.css";
import "../styles/buttons.css";

export default function Header() {
	const [profileOpen, setProfileOpen] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [registerOpen, setRegisterOpen] = useState(false);
	const [remaining, setRemaining] = useState(0);

	const callBlitz = async () => {
		const blitz = await fetch("/api/blitz");

		if (blitz.ok) {
			const _remaining = await blitz.json();

			setRemaining(_remaining);
		} else
			setRemaining(0);
	};

	useEffect(() => {
		callBlitz();
	});

	useEffect(() => {
		const interval = setInterval(() => {
			if (remaining > 0)
				setRemaining(remaining - 1);
		}, 1000);
		return () => clearInterval(interval);
	});

	return (
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
				<h2 className="header-remaining">
					Blitz in {remaining}s
				</h2>
			</div>
			<div className="header-group">
				<button className="header-icon" onClick={() => {location.href="/create"}}>
					<p>+</p>
					<h1>Make Post</h1>
				</button>
				<button className="header-icon" onClick={() => {location.href="/register"}}>
					<p>✨</p>
					<h1>Register</h1>
				</button>
				<button className="header-icon" onClick={() => {location.href="/register"}}>
					<p>🌙</p>
					<h1>Theme</h1>
				</button>
			</div>
			{ profileOpen &&
				<Pro />
			}
		</div>
	);
}
