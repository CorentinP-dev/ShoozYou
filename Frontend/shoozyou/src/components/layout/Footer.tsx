import React from "react";
import { NavLink } from "react-router-dom";

declare global {
    interface Window {
        __openCookiePrefs?: () => void;
    }
}

export default function Footer() {
    const openCookiePrefs = () => window.__openCookiePrefs?.();

    return (
        <footer className="footer-root" role="contentinfo">
            <div className="footer-inner container">
                <div className="footer-col">
                    <div className="footer-brand">
                        <img src="/logo_shoozyou.png" className="footer-logo" />
                        <span>SHOOZYOU</span>
                    </div>
                    <p className="footer-note">Sneakers premium, service rapide, retours faciles.</p>
                </div>

                <div className="footer-col">
                    <div className="footer-title">Boutique</div>
                    <ul className="footer-links">
                        <li><NavLink to="/products">Produits</NavLink></li>
                        <li><NavLink to="/homme">Homme</NavLink></li>
                        <li><NavLink to="/femme">Femme</NavLink></li>
                        <li><NavLink to="/enfant">Enfant</NavLink></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <div className="footer-title">Légal</div>
                    <ul className="footer-links">
                        <li><NavLink to="/privacy">Politique de confidentialité</NavLink></li>
                        <li><NavLink to="/cookies">Politique cookies</NavLink></li>
                        <li><button className="footer-link-btn" onClick={openCookiePrefs}>Paramétrer les cookies</button></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom container">
                <span>© {new Date().getFullYear()} ShoozYou. Tous droits réservés.</span>
            </div>
        </footer>
    );
}
