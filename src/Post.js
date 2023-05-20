import "./Post.css";

// props:
// image; title; author; date
export default function Post(props) {
	return (
		<div className="post">
			<img src={props.image} alt={props.title} />
			<h1>{props.title}</h1>
			<h2>{props.author}</h2>
			<h3>{props.date}</h3>
		</div>
	);
}
