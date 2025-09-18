// src/layouts/MainLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar"; // ou ../components/Navbar si tu n'as pas le sous-dossier

export default function MainLayout() {
    return (
        <>
            <a href="#main" className="sr-only">Aller au contenu</a>
            <Navbar />
            <main id="main" className="container" style={{ padding: "24px 0" }}>
                <Outlet />
            </main>
        </>
    );
}
