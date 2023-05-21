import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import "./styles/index.css";

import Nav from "./Nav.js";

import { App, loadPosts } from "./routes/App.js";
import Login from "./routes/Login.js";
import Register from "./routes/Register.js";
import Create from "./routes/Create.js";

const router = createBrowserRouter([
	{
		path: "/",
		loader: loadPosts,
		element: <App />
	},
	{
		path: "/login",
		element: <Login />
	},
	{
		path: "/register",
		element: <Register />
	},
	{
		path: "/create",
		element: <Create />
	}
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<CookiesProvider>
			<Nav />
			<div class="container">
				<RouterProvider router={router} />
			</div>
		</CookiesProvider>
	</React.StrictMode>
);
