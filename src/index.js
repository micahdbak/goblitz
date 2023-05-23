import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/index.css";

import Header from "./components/Header.js";
import { Home, loadPosts } from "./routes/Home.js";
import { View, loadPost } from "./routes/View.js";
import Login from "./routes/Login.js";
import Register from "./routes/Register.js";
import Create from "./routes/Create.js";
import ViewProfile, { loadProfiles } from "./routes/ViewProfile.js";
import { Resolve, loadResolve } from "./routes/Resolve.js";

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
		path: "/resolve/:UID",
		loader: loadResolve,
		element: <Resolve />
	},
	{
		path: "/create",
		element: <Create />
	},
	{
		path: "/post/:PID",
		loader: loadPost,
		element: <View />
	},
	{
		path: "/user/:link",
		loader: loadProfiles,
		element: <ViewProfile />
	}
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<Header />
		<div class="container">
			<RouterProvider router={router} />
		</div>
	</React.StrictMode>
	);
