import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import CartBadge from "../ui/cartbadge";

/* Icônes */
const CartIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M3 4h1.6a1 1 0 0 1 .98.804L6.9 8.5m0 0L8 14.2a2 2 0 0 0 1.96 1.6h7.94a2 2 0 0 0 1.96-1.6l1.04-5.2H6.9Z"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="19" r="1.6" fill="currentColor"/>
        <circle cx="18" cy="19" r="1.6" fill="currentColor"/>
    </svg>
);
const UserIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V21h18v-1.5C21 16.5 17 14 12 14Z"
              fill="currentColor"/>
    </svg>
);
const LogoutIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M15 17l5-5-5-5M20 12H9M12 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default function Navbar() {
    const { user, logout } = useAuth();
    const { count } = useCart();
    const cartCount = count;
    const firstName = (user?.name || "").split(" ")[0] || user?.email?.split("@")[0] || "";

    const [open, setOpen] = useState(false);
    const active = ({ isActive }: { isActive: boolean }) =>
        "nav-link" + (isActive ? " active" : "");
    const accountActive = ({ isActive }: { isActive: boolean }) =>
        "user-pill" + (isActive ? " active" : "");
    const closeMobile = () => setOpen(false);

    return (
        <header className="nav-root">
            <div className="nav-bar">
                {/* Logo */}
                <Link to="/" className="brand" aria-label="ShoozYou, retour à l’accueil">
                    <img src="/logo_shoozyou.png" alt="" style={{ height: 28 }} />
                    <span style={{ marginLeft: 10, fontWeight: 800 }}>SHOOZYOU</span>
                </Link>

                {/* Nav desktop */}
                <nav className="nav-desktop" aria-label="Navigation principale">
                    <NavLink to="/" end className={active}>Accueil</NavLink>
                    <NavLink to="/homme" className={active}>Homme</NavLink>
                    <NavLink to="/femme" className={active}>Femme</NavLink>
                    <NavLink to="/enfant" className={active}>Enfant</NavLink>

                    {/* Liens de rôle */}
                    {user?.role === "seller" && (
                        <NavLink to="/seller" className={active}>Espace vendeur</NavLink>
                    )}
                    {user?.role === "admin" && (
                        <NavLink to="/admin" className={active}>Espace admin</NavLink>
                    )}
                </nav>

                {/* Actions droite */}
                <div className="actions-desktop">
                    <Link to="/cart" className="icon-link" aria-label="Voir le panier">
                        <span style={{ position: "relative" }}>
                            <CartIcon />
                            <CartBadge count={cartCount} />
                        </span>
                    </Link>

                    {user ? (
                        <>
                            <NavLink to="/account" className={accountActive} title="Mon compte">
                                <UserIcon />
                                <span>{firstName || "Mon compte"}</span>
                            </NavLink>
                            <button className="btn-logout" onClick={logout} aria-label="Se déconnecter">
                                <LogoutIcon />
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" className="icon-link" aria-label="Connexion">
                            <UserIcon />
                        </NavLink>
                    )}

                    {/* Burger */}
                    <button
                        className="nav-toggle"
                        aria-label="Ouvrir le menu"
                        aria-expanded={open}
                        onClick={() => setOpen(v => !v)}
                    >
                        <span className="bar" />
                        <span className="bar" />
                        <span className="bar" />
                    </button>
                </div>
            </div>

            {/* Menu mobile */}
            <div className={"nav-mobile" + (open ? " open" : "")}>
                <ul onClick={closeMobile}>
                    <li><NavLink to="/" end className={active}>Accueil</NavLink></li>
                    <li><NavLink to="/homme" className={active}>Homme</NavLink></li>
                    <li><NavLink to="/femme" className={active}>Femme</NavLink></li>
                    <li><NavLink to="/enfant" className={active}>Enfant</NavLink></li>

                    {user?.role === "seller" && (
                        <li><NavLink to="/seller" className={active}>Espace vendeur</NavLink></li>
                    )}
                    {user?.role === "admin" && (
                        <li><NavLink to="/admin" className={active}>Espace admin</NavLink></li>
                    )}

                    {user && (
                        <li className="mobile-user">
                            <NavLink to="/account" className={accountActive}>
                                <UserIcon />
                                <span>{firstName || "Mon compte"}</span>
                            </NavLink>
                        </li>
                    )}

                    <li className="nav-iconline">
                        <Link to="/cart" className="nav-link">
                            <span className="nav-cart-link">
                                <CartIcon />
                                <span>Panier</span>
                                <CartBadge count={cartCount} />
                            </span>
                        </Link>
                    </li>

                    <li className="mobile-actions">
                        {user ? (
                            <button className="btn-solid" onClick={logout}>Se déconnecter</button>
                        ) : (
                            <NavLink className="btn-solid" to="/login">Se connecter</NavLink>
                        )}
                    </li>
                </ul>
            </div>
        </header>
    );
}
