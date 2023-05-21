import Post from "./Post.js";

const MOUNTAIN = "https://hips.hearstapps.com/hmg-prod/images/beautiful-landscape-view-of-fuji-mountain-in-royalty-free-image-1623253648.jpg";

export default function App() {
	return (
		<>
			<Post image={MOUNTAIN} title="Beautiful B.C. aslkjdfawkljhsdklfjhaskljsdhflkawjhslkdjfhawlk" author="Micah Baker" date="Today" />
			<Post image={MOUNTAIN} title="Beautiful B.C." author="Micah Baker" date="Today" />
			<Post image={MOUNTAIN} title="Beautiful B.C." author="Micah Baker" date="Today" />
		</>
	);
}
