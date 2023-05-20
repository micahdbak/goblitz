import "./containers.css";
import "./buttons.css";

export default function Nav() {
	return (
		<div className="container-fixed">
			<button className="glyptodon">
				Glyptodon
			</button>
			<button className="primary">
				Make Post
			</button>
			<button className="secondary">
				Following
			</button>
			<button className="secondary">
				Explore
			</button>
		</div>
	);
}
