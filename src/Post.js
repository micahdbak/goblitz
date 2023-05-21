import "./Post.css";
import "./buttons.css";
import React, {useState, useCallback} from 'react';

const THUMBSUP = "images/thumbsup_opaque.png"; 

export default function Post(props) {
	const [likeCount, setLikeCount] = useState(0);
	const [liked, setLiked] = useState(0);
	const handleClick = useCallback(() => {
		if(liked == 0){
			setLikeCount(likeCount + 1);
			setLiked(1);
		}
		else {
			setLikeCount(likeCount - 1);
			setLiked(0);
		}
	});
	return (
		<div className="post">
			<img src={props.image} alt={props.title} />
				<div className="post-description">
				<div>
					<h1>{props.title}</h1>
					<h2>{props.author}</h2>
					<h3>{props.date}</h3>
				</div>
				<div className="like_button">
					<button onClick={handleClick}>
						<p>Likes: {likeCount}</p>
						<img src={THUMBSUP} />
					</button>
				</div>
			</div>
		</div>
	);
}
