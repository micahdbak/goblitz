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
function Comment({user, text}){
	return (
		<div className="comment-container">
			<a className="comment-user" href="https://google.com">@{user}</a>
			<p className="comment-text">{text}</p>
		</div>
	);
}


// access with props.---
// contains test values and comments
export default function PostFull(props) {
	return (
		<div className="container">
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
				<div class="btn-row">
					<PostInteractionButton src="images/star.png" className="inter-button"/>
					<PostInteractionButton src="images/download.png" className="inter-button" />
				</div>
				<div className="comment-box">
					<p className="comment-head">Comments</p>
					<Comment user="simon" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" />
					<Comment user="micah" text="FIRST!!!" />
				</div>
			</div>
		</div>
	);
}
