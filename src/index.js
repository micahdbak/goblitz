import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import "./styles/index.css";

import Nav from "./Nav.js";

import { Home, loadPosts } from "./routes/Home.js";
import { View, loadPost } from "./routes/View.js";
import Login from "./routes/Login.js";
import Register from "./routes/Register.js";
import Create from "./routes/Create.js";

const router = createBrowserRouter([
	{
		path: "/",
		loader: loadPosts,
		element: <Home />
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
	},
	{
		path: "/post/:PID",
		loader: loadPost,
		element: <View />
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
