import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";

export default function MainLayout() {
    return (
        <>
            <a href="#main" className="sr-only">Aller au contenu</a>
            <Navbar />
            <main id="main" className="container page">
                <Outlet />
            </main>
        </>
    );
}
