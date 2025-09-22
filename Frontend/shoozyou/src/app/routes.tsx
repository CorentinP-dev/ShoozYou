import React from "react";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Homme from "../pages/Homme";
import Femme from "../pages/Femme";
import Enfant from "../pages/Enfant";
import Cart from "../pages/Cart";
import Login from "../pages/auth/Login";               // ✅
import Privacy from "../pages/Privacy";
import CookiesPolicy from "../pages/Cookies";
import SellerDashboard from "../pages/seller/SellerDashboard";  // ✅
import { RequireRole } from "../components/routing/RequireRole"; // ✅

export type ChildRoute = { path?: string; element: JSX.Element; index?: boolean };

export const childRoutes: ChildRoute[] = [
    { index: true, element: <Home /> },
    { path: "products", element: <Products /> },
    { path: "homme", element: <Homme /> },
    { path: "femme", element: <Femme /> },
    { path: "enfant", element: <Enfant /> },
    { path: "cart", element: <Cart /> },
    { path: "login", element: <Login /> },                         // ✅
    { path: "seller", element: <RequireRole roles={["seller", "admin"]}><SellerDashboard /></RequireRole> }, // ✅
    { path: "privacy", element: <Privacy /> },
    { path: "cookies", element: <CookiesPolicy /> },
];
