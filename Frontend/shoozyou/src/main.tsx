import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import { CartProvider } from "./context/CartContext";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <CartProvider>
            <App />
        </CartProvider>
    </StrictMode>
);
