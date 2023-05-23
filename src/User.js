import "./styles/User.css";

export default function User(props) {
	const user = props.user;
	return (
		<div className="user" onClick={() => {
			location.href = "/user/" + user["UID"];}}>
			<img src={user["Image"]} alt={user["Name"]} />
			<h2>{user["Name"]}</h2>
			<h3>(UID: {user["UID"]})</h3>
		</div>
	);
}
