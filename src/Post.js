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
			<div className="btn-row">
				<button className="row-btn sm primary">1</button>
				<button className="row-btn sm secondary">2</button>
				<button className="row-btn sm secondary">3</button>
			</div>
		</div>
		<div className="like_button">
			<button><img src="images/thumbsup_opaque.png"/></button>
		</div>
		
	  </div>
    </div>
  );
}
