import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";
import "./index.css";

import App from "./App.js";
import Nav from "./Nav.js";
import Pro from "./Pro.js";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />
	}
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<div className="container">
			<div className="left">
				<Nav />
			</div>
			<div className="centre">
				<RouterProvider router={router} />
			</div>
			<div className="right">
				<Pro />
			</div>
		</div>
	</React.StrictMode>
);
