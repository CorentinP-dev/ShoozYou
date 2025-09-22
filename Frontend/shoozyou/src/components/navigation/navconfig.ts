export type NavItem = { to: string; label: string };
const navConfig: NavItem[] = [
    { to: "/", label: "Accueil" },
    { to: "/products", label: "Produits" },
    { to: "/cart", label: "Panier" },
    { to: "/login", label: "Connexion" },
];
export default navConfig;
