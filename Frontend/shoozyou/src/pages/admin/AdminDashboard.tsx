import React, { useMemo, useState } from "react";
import { RequireRole } from "../../components/routing/RequireRole";
import { createProduct, listProducts, removeProduct, updateProduct, type AdminProduct } from "../../services/adminRepo";
import ProductFormModal from "./ProductFormModal";
import ConfirmDialog from "./ConfirmDialog";
import UserRolesModal from "./UserRolesModal";

export default function AdminDashboard() {
    const [q, setQ] = useState("");
    const [items, setItems] = useState<AdminProduct[]>(() => listProducts());
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<AdminProduct | null>(null);
    const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
    const [rolesOpen, setRolesOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!q.trim()) return items;
        const t = q.toLowerCase();
        return items.filter(p =>
            p.name.toLowerCase().includes(t) ||
            p.category.toLowerCase().includes(t)
        );
    }, [q, items]);

    const stats = useMemo(() => {
        const totalProducts = items.length;
        const orders = 0; // a brancher plus tard
        const revenue = 0; // idem
        return { totalProducts, orders, revenue };
    }, [items]);

    const totalStock = (p: AdminProduct) => p.sizes.reduce((n, s) => n + s.stock, 0);

    const doCreate = (data: Omit<AdminProduct, "id">) => {
        const np = createProduct(data);
        setItems(prev => [np, ...prev]);
        setOpenForm(false);
    };
    const doUpdate = (data: Omit<AdminProduct, "id">) => {
        if (!editing) return;
        const up = updateProduct(editing.id, data);
        setItems(prev => prev.map(p => (p.id === up.id ? up : p)));
        setOpenForm(false);
        setEditing(null);
    };
    const doDelete = () => {
        if (!confirm.id) return;
        removeProduct(confirm.id);
        setItems(listProducts());
        setConfirm({ open: false });
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
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Catégorie</th>
                                <th>Prix</th>
                                <th>Stock total</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="row-avatar">
                                            <div className="avatar-sq"><span className="emoji">👟</span></div>
                                            <span>{p.name}</span>
                                        </div>
                                    </td>
                                    <td>{p.category}</td>
                                    <td>{p.price.toFixed(2)}€</td>
                                    <td>{totalStock(p)}</td>
                                    <td className="table-actions">
                                        <button className="link" onClick={() => {
                                            setEditing(p);
                                            setOpenForm(true);
                                        }}>Modifier
                                        </button>
                                        <button className="link danger"
                                                onClick={() => setConfirm({open: true, id: p.id})}>Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
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
                }}
                onSubmit={editing ? doUpdate : doCreate}
                initial={editing}
            />

            <ConfirmDialog
                open={confirm.open}
                onClose={() => setConfirm({ open: false })}
                onConfirm={doDelete}
                message="Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible."
            />

            <UserRolesModal open={rolesOpen} onClose={() => setRolesOpen(false)} />
        </RequireRole>
    );
}
