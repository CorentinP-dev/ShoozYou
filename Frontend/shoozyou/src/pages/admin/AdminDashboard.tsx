import React, { useEffect, useMemo, useState } from "react";
import { RequireRole } from "../../components/routing/RequireRole";
import {
    createAdminProduct,
    deleteAdminProduct,
    fetchAdminProducts,
    updateAdminProduct,
    type AdminProductDto,
    type CreateAdminProductPayload,
} from "../../services/adminApi";
import { fetchGenders, fetchShoeTypes, type GenderDto, type ShoeTypeDto } from "../../services/referenceApi";
import ProductFormModal from "./ProductFormModal";
import ConfirmDialog from "./ConfirmDialog";
import UserRolesModal from "./UserRolesModal";

export default function AdminDashboard() {
    const [q, setQ] = useState("");
    const [items, setItems] = useState<AdminProductDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<AdminProductDto | null>(null);
    const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
    const [rolesOpen, setRolesOpen] = useState(false);

    const [genders, setGenders] = useState<GenderDto[]>([]);
    const [shoeTypes, setShoeTypes] = useState<ShoeTypeDto[]>([]);
    const [referencesLoading, setReferencesLoading] = useState(false);
    const [referencesError, setReferencesError] = useState<string | null>(null);

    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const genderMap = useMemo(() => new Map(genders.map(g => [g.id, g.name])), [genders]);
    const shoeTypeMap = useMemo(() => new Map(shoeTypes.map(t => [t.id, t.name])), [shoeTypes]);

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            try {
                setLoading(true);
                const result = await fetchAdminProducts({ limit: 100 });
                if (!cancelled) {
                    setItems(result.items);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Impossible de charger les produits";
                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProducts();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadReferences = async () => {
            try {
                setReferencesLoading(true);
                const [genderList, shoeTypeList] = await Promise.all([fetchGenders(), fetchShoeTypes()]);
                if (!cancelled) {
                    setGenders(genderList);
                    setShoeTypes(shoeTypeList);
                    setReferencesError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Impossible de charger les références";
                    setReferencesError(message);
                }
            } finally {
                if (!cancelled) {
                    setReferencesLoading(false);
                }
            }
        };

        loadReferences();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        if (!q.trim()) return items;
        const t = q.toLowerCase();
        return items.filter((p) => {
            const category = [genderMap.get(p.genderId ?? ""), shoeTypeMap.get(p.shoeTypeId ?? "")]
                .filter(Boolean)
                .join(" · ");
            return (
                p.name.toLowerCase().includes(t) ||
                p.sku.toLowerCase().includes(t) ||
                p.description.toLowerCase().includes(t) ||
                category.toLowerCase().includes(t)
            );
        });
    }, [items, q, genderMap, shoeTypeMap]);

    const stats = useMemo(() => {
        const totalProducts = items.length;
        const orders = 0; // TODO: brancher lorsque l'API commandes sera prête
        const revenue = 0;
        return { totalProducts, orders, revenue };
    }, [items]);

    const displayCategory = (product: AdminProductDto) => {
        const genderName = genderMap.get(product.genderId ?? "");
        const typeName = shoeTypeMap.get(product.shoeTypeId ?? "");
        return [genderName, typeName].filter(Boolean).join(" · ") || "—";
    };

    const handleCreate = async (data: CreateAdminProductPayload) => {
        setFormSubmitting(true);
        setFormError(null);
        try {
            const created = await createAdminProduct(data);
            setItems(prev => [created, ...prev]);
            setOpenForm(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Création impossible";
            setFormError(message);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleUpdate = async (data: CreateAdminProductPayload) => {
        if (!editing) return;
        setFormSubmitting(true);
        setFormError(null);
        try {
            const updated = await updateAdminProduct(editing.id, data);
            setItems(prev => prev.map(p => (p.id === updated.id ? updated : p)));
            setOpenForm(false);
            setEditing(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Mise à jour impossible";
            setFormError(message);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm.id) return;
        setDeletingId(confirm.id);
        try {
            await deleteAdminProduct(confirm.id);
            setItems(prev => prev.filter(p => p.id !== confirm.id));
            setConfirm({ open: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Suppression impossible";
            alert(message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <RequireRole roles={["admin"]}>
            <div className="container page">

                <div style={{display: "flex", alignItems: "center", gap: 12}}>
                    <h1 style={{margin: 0}}>Administration</h1>
                    <div className="flex-spacer"/>
                    <button className="btn-outline" onClick={() => setRolesOpen(true)}>Gérer les vendeurs</button>
                    <button className="btn-solid" onClick={() => {
                        setEditing(null);
                        setOpenForm(true);
                    }}>
                        Ajouter un produit
                    </button>
                </div>


                {/* Stats */}
                <div className="stats-grid" style={{marginTop: 12}}>
                    <div className="stat-card">
                        <div className="stat-title">Produits totaux</div>
                        <div className="stat-value ok">{stats.totalProducts}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Commandes</div>
                        <div className="stat-value">{stats.orders}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Chiffre d'affaires</div>
                        <div className="stat-value" style={{color: "#7C3AED"}}>
                            {stats.revenue.toFixed(2)}€
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="admin-toolbar">
                    <input className="tool-input" placeholder="Rechercher un produit…" value={q}
                           onChange={e => setQ(e.target.value)}/>
                </div>

                {/* Table */}
                <div className="table-card">
                    <div className="table-title">Gestion des stocks</div>
                    {referencesError && (
                        <div style={{ color: '#b45309', marginBottom: 8 }}>
                            {referencesError}
                        </div>
                    )}
                    {error && (
                        <div style={{ color: '#dc2626', marginBottom: 8 }}>
                            {error}
                        </div>
                    )}
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Catégorie</th>
                                <th>Prix</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Chargement…</td>
                                </tr>
                            )}
                            {!loading && filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="row-avatar">
                                            <div className="avatar-sq"><span className="emoji">👟</span></div>
                                            <div>
                                                <div>{p.name}</div>
                                                <div style={{fontSize: "0.8rem", color: "#777"}}>SKU {p.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{displayCategory(p)}</td>
                                    <td>{p.price.toFixed(2)}€</td>
                                    <td>{p.stock}</td>
                                    <td className="table-actions">
                                        <button className="link" onClick={() => {
                                            setEditing(p);
                                            setOpenForm(true);
                                        }}>Modifier
                                        </button>
                                        <button
                                            className="link danger"
                                            onClick={() => setConfirm({open: true, id: p.id})}
                                            disabled={deletingId === p.id}
                                        >
                                            {deletingId === p.id ? 'Suppression…' : 'Supprimer'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{textAlign: "center", padding: 20, color: "#777"}}>
                                        Aucun produit ne correspond à la recherche.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <ProductFormModal
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setEditing(null);
                    setFormError(null);
                }}
                onSubmit={editing ? handleUpdate : handleCreate}
                initial={editing}
                genders={genders}
                shoeTypes={shoeTypes}
                loadingReferences={referencesLoading}
                submitting={formSubmitting}
                errorMessage={formError}
            />

            <ConfirmDialog
                open={confirm.open}
                onClose={() => setConfirm({ open: false })}
                onConfirm={handleDelete}
                message="Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible."
            />

            <UserRolesModal open={rolesOpen} onClose={() => setRolesOpen(false)} />
        </RequireRole>
    );
}
