import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";
import { CookiesProvider } from "react-cookie";
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
		<CookiesProvider>
			<Nav />
			<RouterProvider router={router} />
		</CookiesProvider>
	</React.StrictMode>
);
