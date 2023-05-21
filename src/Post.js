import React, {useState, useCallback} from 'react';

import "./styles/Post.css";
import "./styles/buttons.css";

const STAR_TRANSPARENT = "images/star.png";
const STAR_YELLOW = "images/star_yellow.png";

export default function Post(props) {
	/*
	const [likeCount, setLikeCount] = useState(0);
	const [liked, setLiked] = useState(0);
	const [curSymb, setSymb] = useState(STAR_TRANSPARENT);
	const [plural, setPlural] = useState("s");
	const handleClick = useCallback(() => {
		if(liked == 0){
			setLikeCount(likeCount + 1);
			setLiked(1);
			setSymb(STAR_YELLOW);
		}
		else {
			setLikeCount(likeCount - 1);
			setLiked(0);
			setSymb(STAR_TRANSPARENT);
		}
		setPlural((likeCount == 1) ? "s" : "");
	});
	*/
	return (
		<div className="post" onClick={() => {location.href = "/post/" + props["PID"]}}>
			<img src={props["Image"]} alt={props["Title"]}/>
			<h1>{props["Title"]}</h1>
			<h2>
				{props.Users[parseInt(props["UID"])]["Name"]}&nbsp;
				<span class="UID">(UID: {props["UID"]})</span>
			</h2>
			<h3>{props["Date"]}</h3>
		</div>
	);
}
