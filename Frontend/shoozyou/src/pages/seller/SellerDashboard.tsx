import { useEffect, useMemo, useState } from "react";
import { RequireRole } from "../../components/routing/RequireRole";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";
import {
    fetchSellerInventory,
    type InventoryStatus,
    type SellerInventoryProduct,
    type SellerInventoryStats,
} from "../../services/sellerApi";
import { fetchOrderMetrics } from "../../services/adminApi";

type CategoryFilter = "Toutes" | "Homme" | "Femme" | "Enfant" | "Mixte";
type StockFilter = "Tous" | "En stock" | "Stock faible" | "Rupture";

const CATEGORY_LABELS: Record<SellerInventoryProduct["category"], CategoryFilter> = {
    homme: "Homme",
    femme: "Femme",
    enfant: "Enfant",
    mixte: "Mixte",
};

const STATUS_LABELS: Record<InventoryStatus, StockFilter> = {
    IN_STOCK: "En stock",
    LOW_STOCK: "Stock faible",
    OUT_OF_STOCK: "Rupture",
};

const STATUS_CLASS: Record<InventoryStatus, "ok" | "warn" | "danger"> = {
    IN_STOCK: "ok",
    LOW_STOCK: "warn",
    OUT_OF_STOCK: "danger",
};

const PAGE_SIZE = 20;

export default function SellerDashboard() {
    const { user } = useAuth();
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<CategoryFilter>("Toutes");
    const [stock, setStock] = useState<StockFilter>("Tous");
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<SellerInventoryProduct[]>([]);
    const [stats, setStats] = useState<SellerInventoryStats | null>(null);
    const [orderMetrics, setOrderMetrics] = useState<{ totalOrders: number; totalRevenue: number }>({ totalOrders: 0, totalRevenue: 0 });
    const [orderMetricsLoading, setOrderMetricsLoading] = useState(false);
    const [orderMetricsError, setOrderMetricsError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchSellerInventory();
                if (cancelled) return;
                setProducts(response.products);
                setStats(response.stats);
            } catch (err) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Impossible de récupérer l'inventaire";
                setError(message);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadMetrics = async () => {
            try {
                setOrderMetricsLoading(true);
                const metrics = await fetchOrderMetrics();
                if (!cancelled) {
                    setOrderMetrics(metrics);
                    setOrderMetricsError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Impossible de charger les commandes";
                    setOrderMetricsError(message);
                }
            } finally {
                if (!cancelled) {
                    setOrderMetricsLoading(false);
                }
            }
        };

        loadMetrics();
        return () => {
            cancelled = true;
        };
    }, []);

    const inventoryStats = stats ?? {
        totalProducts: 0,
        totalStock: 0,
        inStockProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
    };

    const filtered = useMemo(() => {
        return products
            .filter((product) => {
                if (!q.trim()) return true;
                const term = q.trim().toLowerCase();
                const categoryLabel = CATEGORY_LABELS[product.category];
                return (
                    product.name.toLowerCase().includes(term) ||
                    product.sku.toLowerCase().includes(term) ||
                    categoryLabel.toLowerCase().includes(term)
                );
            })
            .filter((product) => (cat === "Toutes" ? true : CATEGORY_LABELS[product.category] === cat))
            .filter((product) => {
                if (stock === "Tous") return true;
                const label = STATUS_LABELS[product.status];
                if (stock === "Rupture") return label === "Rupture";
                if (stock === "Stock faible") return label === "Stock faible";
                if (stock === "En stock") return label === "En stock";
                return true;
            });
    }, [cat, products, q, stock]);

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

    const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
    const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    return (
        <RequireRole roles={["seller", "admin"]}>
            <div className="container page">
                <h1>Espace Vendeur</h1>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Stock total</div>
                        <div className="stat-value ok">{inventoryStats.totalStock}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Produits en stock</div>
                        <div className="stat-value ok">{inventoryStats.inStockProducts}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Stock faible</div>
                        <div className="stat-value warn">{inventoryStats.lowStockProducts}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Ruptures</div>
                        <div className="stat-value danger">{inventoryStats.outOfStockProducts}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Commandes</div>
                        <div className="stat-value">{orderMetricsLoading ? "…" : orderMetrics.totalOrders}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Chiffre d'affaires</div>
                        <div className="stat-value" style={{ color: "#7C3AED" }}>
                            {orderMetricsLoading ? "…" : formatPrice(orderMetrics.totalRevenue)}
                        </div>
                    </div>
                </div>

                {orderMetricsError && (
                    <div style={{ color: '#dc2626', marginTop: 8 }}>
                        {orderMetricsError}
                    </div>
                )}

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
                                    {error}
                                </td></tr>
                            ) : pageItems.length > 0 ? (
                                pageItems.map((product) => {
                                    const variants = product.variants.length
                                        ? product.variants
                                        : [{ id: `${product.id}-unique`, sizeValue: 'unique', sizeLabel: 'Unique', stock: product.totalStock }];
                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="row-avatar">
                                                    <div className="avatar-sq"><span className="emoji">👟</span></div>
                                                    <span>{product.name}</span>
                                                </div>
                                            </td>
                                            <td>{CATEGORY_LABELS[product.category]}</td>
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
                          <span className={`status ${STATUS_CLASS[product.status]}`}>
                            {STATUS_LABELS[product.status]}
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
