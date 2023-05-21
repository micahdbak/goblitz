import "./Post.css";
import "./buttons.css";

export default function Post(props) {
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
			<button><img src="images/thumbsup_opaque.png"/></button>
		</div>
		
	  </div>
    </div>
  );
}
