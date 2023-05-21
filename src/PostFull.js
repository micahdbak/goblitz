import React from 'react';
import "./styles/buttons.css";
import "./styles/PostFull.css";
import { useNavigate } from 'react-router-dom';

function GoBackButton(){
	const history = useNavigate();
	const goBack = () => {
		history(-1);	
	};

	return (
		<button className="btn primary go-back-button" onClick={goBack}>Go Back</button>
	);
}
function PostInteractionButton({src}){
	return (
		<div className="focused">
			<button className="btn secondary">
					<img src={src} />
			</button>
		</div>

	);
}
// access with props.---
export default function PostFull(props) {
	return (
		<div className="post-focused">
			<GoBackButton />
			<div className="post-display">
				<div className="image-photo">
					<img src={props.image}/>
				</div>
			</div>
			<h1>{props.title}</h1>
			<h2>Posted by <a href="https://google.com">@{props.author}</a></h2>
			<p>Liked by: 829</p>
			<div className="btn-row">
				<PostInteractionButton src="images/star.png" className="inter-button"/>
				<PostInteractionButton src="images/star_yellow.png" className="inter-button"/>
			</div>
		</div>
	);
}
