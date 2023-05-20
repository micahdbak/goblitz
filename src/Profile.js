import "./Profile.css";

// props:
// image: image used for the profile picture
// name: name of profile
export default function Profile(props) {
	return (
		<div className="profile">
			<img src={props.image} alt={props.name} />
			<h1>{props.name}</h1>
		</div>
	);
}
