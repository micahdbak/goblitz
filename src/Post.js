import React, { useState, useCallback, useEffect } from 'react';

import User from "./User.js";

import "./styles/Post.css";
import "./styles/buttons.css";

const STAR_TRANSPARENT = "images/star.png";
const STAR_YELLOW = "images/star_yellow.png";

export default function Post(props) {
	const post = props["post"];
	const UID = parseInt(post["UID"]);
	const user = props.users[UID];
	const handleClick = props.clickable ? () => {
		location.href = "/post/" + post["PID"];
	} : () => {};
	const [mark, setMark] = useState(parseInt(post["Mark"]));

	useEffect(() => {
		const interval = setInterval(() => {
			if (mark > 0)
				setMark(mark - 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [mark]);

	return (
		<div className="post" onClick={handleClick}>
			<div className="img-container">
				<img src={post["Image"]} alt={post["Title"]}/>
			</div>
			<h1 className="title">{post["Title"]}</h1>
			<User user={user} />
			<h3 className="mark">{mark}</h3>
		</div>
	);
}
