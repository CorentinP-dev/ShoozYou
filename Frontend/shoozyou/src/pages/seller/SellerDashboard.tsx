import { useEffect, useMemo, useState } from "react";
import { RequireRole } from "../../components/routing/RequireRole";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../features/products/useProducts";
import type { Product } from "../../services/productService";
import { formatPrice } from "../../utils/format";

type CategoryFilter = "Toutes" | "Homme" | "Femme" | "Enfant" | "Mixte";
type StockFilter = "Tous" | "En stock" | "Stock faible" | "Rupture";

const LABELS: Record<Product["category"], CategoryFilter> = {
    homme: "Homme",
    femme: "Femme",
    enfant: "Enfant",
    mixte: "Mixte",
};

const computeStatus = (product: Product): StockFilter => {
    const totalVariantes = product.variants.length;
    if (totalVariantes === 0) {
        return product.stock > 0 ? "En stock" : "Rupture";
    }

    const stockByVariant = product.variants.map((variant) => variant.stock);
    const allZero = stockByVariant.every((stock) => stock === 0);
    if (allZero) {
        return "Rupture";
    }

    const anyZero = stockByVariant.some((stock) => stock === 0);
    if (anyZero) {
        return "Rupture";
    }

    const anyLow = stockByVariant.some((stock) => stock > 0 && stock <= 3);
    if (anyLow) {
        return "Stock faible";
    }

    return "En stock";
};

const PAGE_SIZE = 20;

export default function SellerDashboard() {
    const { user } = useAuth();
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<CategoryFilter>("Toutes");
    const [stock, setStock] = useState<StockFilter>("Tous");
    const [page, setPage] = useState(1);

    const { loading, list, error } = useProducts({ limit: 50, fetchAll: true });

    const productsWithStatus = useMemo(() =>
        list.map((product) => ({ ...product, status: computeStatus(product) })),
    [list]);

    const filtered = useMemo(() => {
        return productsWithStatus
            .filter((product) => {
                if (!q.trim()) return true;
                const term = q.trim().toLowerCase();
                const categoryLabel = LABELS[product.category];
                return (
                    product.name.toLowerCase().includes(term) ||
                    product.sku.toLowerCase().includes(term) ||
                    categoryLabel.toLowerCase().includes(term)
                );
            })
            .filter((product) => (cat === "Toutes" ? true : LABELS[product.category] === cat))
            .filter((product) => {
                if (stock === "Tous") return true;
                if (stock === "Rupture") return product.status === "Rupture";
                if (stock === "Stock faible") return product.status === "Stock faible";
                if (stock === "En stock") return product.status === "En stock";
                return true;
            });
    }, [cat, productsWithStatus, q, stock]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [filtered.length, page]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);
    const pageItems = useMemo(
        () => filtered.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE),
        [filtered, page],
    );

    const stats = useMemo(() => {
        return productsWithStatus.reduce(
            (acc, product) => {
                if (product.status === "Rupture") acc.ruptureProducts += 1;
                if (product.status === "Stock faible") acc.lowStockProducts += 1;
                if (product.status === "En stock") acc.inStockProducts += 1;

                product.variants.forEach((variant) => {
                    acc.totalStock += variant.stock;
                });

                return acc;
            },
            { inStockProducts: 0, lowStockProducts: 0, ruptureProducts: 0, totalStock: 0, orders: 0 }
        );
    }, [productsWithStatus]);

    const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
    const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    return (
        <RequireRole roles={["seller", "admin"]}>
            <div className="container page">
                <h1>Espace Vendeur</h1>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Stock total</div>
                        <div className="stat-value ok">{stats.totalStock}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Produits en stock</div>
                        <div className="stat-value ok">{stats.inStockProducts}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Stock faible</div>
                        <div className="stat-value warn">{stats.lowStockProducts}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Ruptures</div>
                        <div className="stat-value danger">{stats.ruptureProducts}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Commandes</div>
                        <div className="stat-value">{stats.orders}</div>
                    </div>
                </div>

                <div className="admin-toolbar">
                    <input
                        className="tool-input"
                        placeholder="Rechercher un produit…"
                        value={q}
                        onChange={(e) => {
                            setPage(1);
                            setQ(e.target.value);
                        }}
                    />
                    <select
                        className="tool-select"
                        value={cat}
                        onChange={(e) => {
                            setPage(1);
                            setCat(e.target.value as CategoryFilter);
                        }}
                    >
                        <option value="Toutes">Toutes</option>
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Enfant">Enfant</option>
                        <option value="Mixte">Mixte</option>
                    </select>
                    <select
                        className="tool-select"
                        value={stock}
                        onChange={(e) => {
                            setPage(1);
                            setStock(e.target.value as StockFilter);
                        }}
                    >
                        <option value="Tous">Tous</option>
                        <option value="En stock">En stock</option>
                        <option value="Stock faible">Stock faible</option>
                        <option value="Rupture">Rupture</option>
                    </select>
                    <div className="flex-spacer" />
                    <div className="role-pill">Vendeur {user?.name?.toUpperCase?.()}</div>
                </div>

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
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24 }}>Chargement…</td></tr>
                            ) : error ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: '#dc2626' }}>
                                    {error instanceof Error ? error.message : 'Impossible de récupérer les produits'}
                                </td></tr>
                            ) : pageItems.length > 0 ? (
                                pageItems.map((product) => {
                                    const status = computeStatus(product);
                                    const variants = product.variants.length
                                        ? product.variants
                                        : [{ id: `${product.id}-fallback`, sizeValue: 'N/A', sizeLabel: 'N/A', stock: product.stock }];
                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="row-avatar">
                                                    <div className="avatar-sq"><span className="emoji">👟</span></div>
                                                    <span>{product.name}</span>
                                                </div>
                                            </td>
                                            <td>{LABELS[product.category]}</td>
                                            <td>{formatPrice(product.price)}</td>
                                            <td>
                                                <div className="sizes-line">
                                                    {variants.map((variant) => (
                                                        <span
                                                            key={variant.id}
                                                            className={
                                                                "chip " +
                                                                (variant.stock === 0
                                                                    ? "chip-out"
                                                                    : variant.stock <= 3
                                                                    ? "chip-low"
                                                                    : "chip-ok")
                                                            }
                                                            title={`Taille ${variant.sizeLabel} — stock : ${variant.stock}`}
                                                        >
                            {variant.sizeLabel}: {variant.stock}
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
                                })
                            ) : (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "#777" }}>
                                    Aucun produit ne correspond à vos filtres.
                                </td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16}}>
                        <div>Page {page} / {totalPages}</div>
                        <div className="pagination">
                            <button className="btn" disabled={page <= 1 || loading} onClick={handlePrev}>
                                Précédent
                            </button>
                            <button className="btn" disabled={page >= totalPages || loading} onClick={handleNext}>
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RequireRole>
    );
}
