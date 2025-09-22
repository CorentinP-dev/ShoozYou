export type NavItem = { to: string; label: string };

const navConfig: NavItem[] = [
    { to: "/",       label: "Accueil" },
    { to: "/homme",  label: "Homme" },
    { to: "/femme",  label: "Femme" },
    { to: "/enfant", label: "Enfant" },
];

export default navConfig;
