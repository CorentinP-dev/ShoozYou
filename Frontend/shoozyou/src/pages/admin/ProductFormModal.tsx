import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import type { AdminCategory, AdminProduct, AdminSizeStock } from "../../services/adminRepo";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<AdminProduct, "id">) => void;
    initial?: AdminProduct | null;
};

const CATEGORIES: AdminCategory[] = ["Homme", "Femme", "Enfant"];

export default function ProductFormModal({ open, onClose, onSubmit, initial }: Props) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState<AdminCategory>("Enfant");
    const [price, setPrice] = useState<number>(69.99);
    const [sizes, setSizes] = useState<AdminSizeStock[]>([{ size: 30, stock: 10 }]);

    useEffect(() => {
        if (initial) {
            setName(initial.name);
            setCategory(initial.category);
            setPrice(initial.price);
            setSizes(initial.sizes.length ? initial.sizes : [{ size: 30, stock: 10 }]);
        } else {
            setName("");
            setCategory("Enfant");
            setPrice(69.99);
            setSizes([{ size: 30, stock: 10 }]);
        }
    }, [initial, open]);

    const addRow = () => setSizes(s => [...s, { size: 0, stock: 0 }]);
    const removeRow = (i: number) => setSizes(s => s.filter((_, idx) => idx !== i));
    const updateRow = (i: number, patch: Partial<AdminSizeStock>) =>
        setSizes(s => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = sizes.filter(r => r.size && r.stock >= 0);
        onSubmit({ name, category, price: Number(price), sizes: clean });
    };

    return (
        <Modal open={open} onClose={onClose} width={720}>
            <form onSubmit={handleSubmit}>
                <h2 style={{ marginTop: 0 }}>{initial ? "Modifier le produit" : "Ajouter un produit"}</h2>

                <div className="grid2">
                    <label className="field">
                        <span>Nom</span>
                        <input value={name} onChange={e => setName(e.target.value)} required />
                    </label>
                    <label className="field">
                        <span>Catégorie</span>
                        <select value={category} onChange={e => setCategory(e.target.value as AdminCategory)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>
                    <label className="field">
                        <span>Prix</span>
                        <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                    </label>
                </div>

                <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Tailles & stocks</div>
                    <div className="sizes-editor">
                        {sizes.map((row, idx) => (
                            <div className="sizes-row" key={idx}>
                                <input
                                    className="sz-input"
                                    type="number"
                                    placeholder="Taille"
                                    value={row.size}
                                    onChange={e => updateRow(idx, { size: Number(e.target.value) })}
                                    required
                                />
                                <input
                                    className="sz-input"
                                    type="number"
                                    placeholder="Stock"
                                    value={row.stock}
                                    onChange={e => updateRow(idx, { stock: Number(e.target.value) })}
                                    required
                                />
                                <button type="button" className="btn" onClick={() => removeRow(idx)}>Retirer</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" className="btn" onClick={addRow}>+ Ajouter une ligne</button>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button type="button" className="btn" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn-solid">{initial ? "Enregistrer" : "Créer"}</button>
                </div>
            </form>
        </Modal>
    );
}
