// src/app/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import Login from "../pages/Login";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Route racine avec layout */}
                <Route path="/" element={<MainLayout />}>
                    {/* index = "/" */}
                    <Route index element={<Home />} />
                    {/* enfants sans leading slash */}
                    <Route path="products" element={<Products />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    {/* optionnel: 404 */}
                    {/* <Route path="*" element={<div>Page introuvable</div>} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
