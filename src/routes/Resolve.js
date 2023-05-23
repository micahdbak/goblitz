import { useLoaderData } from "react-router-dom";

import "../styles/forms.css";

export function loadResolve({ params }) {
	return params.UID;
}

export function Resolve(props) {
	const UID = useLoaderData();
	return (
		<div className="form-container">
			<h1>User created.</h1>
			<p>Your UID is {UID}.</p>
			<p className="important">Write this down; you need it to access your account.</p>
		</div>
	);
}
