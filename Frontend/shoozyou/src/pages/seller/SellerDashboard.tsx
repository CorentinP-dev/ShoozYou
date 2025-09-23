import { useMemo, useState } from "react";
import { RequireRole } from "../../components/routing/RequireRole";
import { useAuth } from "../../context/AuthContext";

/* Types & données mock */
type Category = "Homme" | "Femme" | "Enfant";
type Item = {
    id: string;
    name: string;
    category: Category;
    price: number;
    sizes: Array<{ size: number; stock: number }>;
};

const INVENTORY: Item[] = [
    { id: "1", name: "Air Max Classic", category: "Homme", price: 129.99, sizes: [ {size:39,stock:5},{size:40,stock:8},{size:41,stock:12},{size:42,stock:15},{size:43,stock:10},{size:44,stock:7},{size:45,stock:3} ] },
    { id: "2", name: "Urban Runner", category: "Femme", price: 89.99, sizes: [ {size:36,stock:8},{size:37,stock:12},{size:38,stock:15},{size:39,stock:18},{size:40,stock:10},{size:41,stock:5} ] },
    { id: "3", name: "Kids Sport", category: "Enfant", price: 59.99, sizes: [ {size:28,stock:6},{size:29,stock:8},{size:30,stock:10},{size:31,stock:12},{size:32,stock:8},{size:33,stock:5},{size:34,stock:3} ] },
    { id: "4", name: "Street Style Pro", category: "Homme", price: 159.99, sizes: [ {size:40,stock:4},{size:41,stock:7},{size:42,stock:12},{size:43,stock:15},{size:44,stock:8},{size:45,stock:2} ] },
    { id: "5", name: "Elegant Walk", category: "Femme", price: 119.99, sizes: [ {size:36,stock:2},{size:37,stock:6},{size:38,stock:4} ] },
    { id: "6", name: "Junior Boost", category: "Enfant", price: 69.99, sizes: [ {size:30,stock:0},{size:31,stock:0},{size:32,stock:0} ] }, // rupture
];

function isRupture(item: Item) {
    return item.sizes.every(s => s.stock === 0);
}
function isLow(item: Item, threshold = 3) {
    // low si au moins une taille <= threshold et pas rupture totale
    return !isRupture(item) && item.sizes.some(s => s.stock > 0 && s.stock <= threshold);
}
function isInStock(item: Item) {
    return item.sizes.some(s => s.stock > 0);
}

export default function SellerDashboard() {
    const { user } = useAuth();
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<"Toutes" | Category>("Toutes");
    const [stock, setStock] = useState<"Tous" | "En stock" | "Stock faible" | "Rupture">("Tous");

    const filtered = useMemo(() => {
        let list = INVENTORY;

        if (q.trim()) {
            const term = q.trim().toLowerCase();
            list = list.filter(it =>
                it.name.toLowerCase().includes(term) ||
                it.category.toLowerCase().includes(term)
            );
        }
        if (cat !== "Toutes") list = list.filter(it => it.category === cat);

        if (stock !== "Tous") {
            list = list.filter(it => {
                if (stock === "Rupture") return isRupture(it);
                if (stock === "Stock faible") return isLow(it);
                if (stock === "En stock") return isInStock(it);
                return true;
            });
        }
        return list;
    }, [q, cat, stock]);

    const stats = useMemo(() => {
        const totalInStock = INVENTORY.filter(isInStock).length;
        const low = INVENTORY.filter(isLow).length;
        const rupt = INVENTORY.filter(isRupture).length;
        return { totalInStock, low, rupt, orders: 0 };
    }, []);

    return (
        <RequireRole roles={["seller", "admin"]}>
            <div className="container page">
                <h1>Espace Vendeur</h1>

                {/* Stat cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Produits en stock</div>
                        <div className="stat-value ok">{stats.totalInStock}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Stock faible</div>
                        <div className="stat-value warn">{stats.low}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Ruptures</div>
                        <div className="stat-value danger">{stats.rupt}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Commandes</div>
                        <div className="stat-value">{stats.orders}</div>
                    </div>
                </div>

                {/* Toolbar : recherche + filtres */}
                <div className="admin-toolbar">
                    <input
                        className="tool-input"
                        placeholder="Rechercher un produit…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <select className="tool-select" value={cat} onChange={(e) => setCat(e.target.value as any)}>
                        <option>Toutes</option>
                        <option>Homme</option>
                        <option>Femme</option>
                        <option>Enfant</option>
                    </select>
                    <select className="tool-select" value={stock} onChange={(e) => setStock(e.target.value as any)}>
                        <option>Tous</option>
                        <option>En stock</option>
                        <option>Stock faible</option>
                        <option>Rupture</option>
                    </select>
                    <div className="flex-spacer" />
                    <div className="role-pill">Vendeur {user?.name?.toUpperCase?.()}</div>
                </div>

                {/* Tableau inventaire */}
                <div className="table-card">
                    <div className="table-title">Inventaire détaillé</div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Catégorie</th>
                                <th>Prix</th>
                                <th>Tailles disponibles</th>
                                <th>Statut</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((it) => {
                                const status = isRupture(it) ? "Rupture" : isLow(it) ? "Stock faible" : "En stock";
                                return (
                                    <tr key={it.id}>
                                        <td>
                                            <div className="row-avatar">
                                                <div className="avatar-sq">
                                                    <span className="emoji">👟</span>
                                                </div>
                                                <span>{it.name}</span>
                                            </div>
                                        </td>
                                        <td>{it.category}</td>
                                        <td>{it.price.toFixed(2)}€</td>
                                        <td>
                                            <div className="sizes-line">
                                                {it.sizes.map(s => (
                                                    <span
                                                        key={s.size}
                                                        className={
                                                            "chip " +
                                                            (s.stock === 0 ? "chip-out" : s.stock <= 3 ? "chip-low" : "chip-ok")
                                                        }
                                                        title={`Taille ${s.size} — stock : ${s.stock}`}
                                                    >
                              {s.size}: {s.stock}
                            </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                        <span className={
                            "status " + (status === "Rupture" ? "danger" : status === "Stock faible" ? "warn" : "ok")
                        }>
                          {status}
                        </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "#777" }}>
                                        Aucun produit ne correspond à vos filtres.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RequireRole>
    );
}
