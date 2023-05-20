import Profile from "./Profile.js";
import "./buttons.css";
import "./headers.css";

const DOG_IMG = "https://imagesvc.meredithcorp.io/v3/mm/image?q=60&c=sc&poi=%5B900%2C533%5D&w=2000&h=1333&url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F47%2F2021%2F03%2F12%2Fpomeranian-white-puppy-921029690-2000.jpg";

export default function Pro() {
	return (
		<>
			<Profile image={DOG_IMG} name="Micah Baker" />
			<div className="btn-row">
				<button className="row-btn sm primary">
					Edit Profile
				</button>
				<button className="row-btn sm secondary">
					View Profile
				</button>
			</div>
			<div className="text-container">
				<h1 className="section">Following</h1>
			</div>
			<Profile image={DOG_IMG} name="Nakul Bansal" />
			<Profile image={DOG_IMG} name="Simon Purdon" />
			<Profile image={DOG_IMG} name="Akki Singh" />
			<div className="text-container">
				<h1 className="hint">Click to view more</h1>
			</div>
			<div className="text-container">
				<h1 className="section">Recents</h1>
			</div>
			<Profile image={DOG_IMG} name="Nakul Bansal" />
			<Profile image={DOG_IMG} name="Nakul Bansal" />
			<Profile image={DOG_IMG} name="Nakul Bansal" />
		</>
	);
}
