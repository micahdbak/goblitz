import "../styles/User.css";
import "../styles/menus.css";

export default function User(props) {
	const user = props.user;
	return (
		<div className="menu-box">
			<div className="user-row">
				<img className="user-img" src={user["Image"]} alt={user["Name"]} />
				<h1 className="user-name">{user["Name"]}</h1>
			</div>
			<hr />
			<p>{user["Text"]}</p>
		</div>
	);
}
