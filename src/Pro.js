import { useCookies } from "react-cookie";

import Profile from "./Profile.js";

import "./styles/buttons.css";
import "./styles/headers.css";
import "./styles/Pro.css";

export default function Pro() {
	const [cookies, setCookie, removeCookie] = useCookies(["user_UID, user_Name, user_Image, user_Date"]);
	const logOut = () => {
		removeCookie("user_UID");
		removeCookie("user_Name");
		removeCookie("user_Image");
		removeCookie("user_Date");

		location.href = "/";
	};
	return (
		<div className="pro-container">
			<Profile image={cookies["user_Image"]} name={cookies["user_Name"]} />
			<div className="btn-row">
				<button className="btn primary"
					onClick={logOut}>
					Log Out
				</button>
			</div>
		</div>
	);
}
