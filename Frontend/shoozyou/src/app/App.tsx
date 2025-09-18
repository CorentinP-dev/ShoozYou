import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";  // ✅ M et L majuscules
import { routes } from "./routes";               // ✅ routes.tsx se trouve dans /app

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    {routes.map(r => (
                        <Route key={r.path} path={r.path} element={r.element} />
                    ))}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
