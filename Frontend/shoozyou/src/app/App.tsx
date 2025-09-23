import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { childRoutes } from "./routes";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    {childRoutes.map((route) =>
                        route.index ? (
                            <Route key="index" index element={route.element} />
                        ) : (
                            <Route key={route.path} path={route.path!} element={route.element} />
                        )
                    )}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
