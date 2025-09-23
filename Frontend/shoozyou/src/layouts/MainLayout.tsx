import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/layout/Footer";
import CookieBanner from "../components/cookies/CookieBanner";

export default function MainLayout() {
    return (
        <div className="app-shell">
            <a href="#main" className="sr-only">Aller au contenu</a>

            <Navbar />

            {/* Le main occupe tout l’espace disponible -> pousse le footer en bas */}
            <main id="main" className="container page">
                <Outlet />
            </main>

            <Footer />

            {/* Bannière RGPD (fixe) */}
            <CookieBanner />
        </div>
    );
}
