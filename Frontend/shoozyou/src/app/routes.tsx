import React from "react";
import Home from "../pages/Home.tsx";
import Products from "../pages/Products.tsx";
import Cart from "../pages/Cart.tsx";
import Login from "../pages/Login.tsx";

export type AppRoute = { path: string; label: string; element: JSX.Element };

export const routes: AppRoute[] = [
    { path: "/", label: "Accueil", element: <Home /> },
    { path: "/products", label: "Produits", element: <Products /> },
    { path: "/cart", label: "Panier", element: <Cart /> },
    { path: "/login", label: "Connexion", element: <Login /> },
];
