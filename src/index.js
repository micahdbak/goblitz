import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";
import "./index.css";

import Nav from "./Nav.js";
import Pro from "./Pro.js";

import { App, loadPosts } from "./App.js";

const router = createBrowserRouter([
	{
		path: "/",
		loader: loadPosts,
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
