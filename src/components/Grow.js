import "../styles/menus.css";

export default function Grow(props) {
	const handle = () => {
		if (props.click != null)
			props.click();
		else
		if (props.link != null)
			location.href = props.link
	}
	const normal = props.image == null ?
		<h1 className="normal">{props.normal}</h1> :
		<img className="normal" src={props.image} alt={props.hover} />;

	return (
		<button className="grow" onClick={handle}>
			{normal}
			<h1 className="hover">{props.hover}</h1>
		</button>
	);
}
