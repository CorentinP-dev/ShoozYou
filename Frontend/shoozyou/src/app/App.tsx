import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { childRoutes } from "./routes";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    {childRoutes.map((r, i) =>
                        r.index ? (
                            <Route key="index" index element={r.element} />
                        ) : (
                            <Route key={r.path} path={r.path!} element={r.element} />
                        )
                    )}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
