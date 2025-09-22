import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../ui/Logo";
import { CartIcon, UserIcon } from "../ui/icons";
import navConfig from "./navConfig";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
    const { count } = useCart();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onResize = () => { if (window.innerWidth > 768 && open) setOpen(false); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [open]);

    return (
        <header className="nav-root" role="banner">
            <div className="nav-bar">
                <NavLink to="/" className="brand" aria-label="Aller à l'accueil">
                    <Logo />
                </NavLink>

                <nav className="nav-desktop" aria-label="Navigation principale">
                    {navConfig.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="actions-desktop" style={{ position: "relative" }}>
                    <NavLink to="/cart" className="icon-link" aria-label="Panier" style={{ position: "relative" }}>
                        {count > 0 && <span className="badge-count">{count}</span>}
                        <CartIcon />
                    </NavLink>
                    <NavLink to="/login" className="icon-link" aria-label="Connexion">
                        <UserIcon />
                    </NavLink>
                    <button
                        className="nav-toggle"
                        aria-label="Ouvrir le menu"
                        aria-expanded={open}
                        aria-controls="nav-mobile"
                        onClick={() => setOpen(!open)}
                    >
                        <span className="bar" /><span className="bar" /><span className="bar" />
                    </button>
                </div>
            </div>

            <nav id="nav-mobile" className={`nav-mobile ${open ? "open" : ""}`} aria-label="Navigation principale (mobile)">
                <ul>
                    {navConfig.map(item => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.to === "/"}
                                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
