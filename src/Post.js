import React, {useState, useCallback} from 'react';

import "./styles/Post.css";
import "./styles/buttons.css";

const STAR_TRANSPARENT = "images/star.png";
const STAR_YELLOW = "images/star_yellow.png";

export default function Post(props) {
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
	return (
		<div className="post">
			<a href="/post"><img src={props.image} alt={props.title}/></a>
				<div className="post-description">
				<div>
					<a href="/post"><h1>{props.title}</h1></a>
					<h2>{props.author}</h2>
					<h3>{props.date}</h3>
				</div>
				<div className="like_button">
					<button className="btn" onClick={handleClick}>
						<p>{likeCount} like{plural} </p>
						<img 
							src={curSymb} 
							onClick={handleClick}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}
