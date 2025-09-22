import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// (Option A du shim peut être ici, tout en haut)
;(window as any).global = window
;(window as any).process = (window as any).process || { env: {} }

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    </StrictMode>
);
