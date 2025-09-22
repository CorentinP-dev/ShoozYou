import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import type { CreateAdminProductPayload, AdminProductDto } from "../../services/adminApi";
import type { GenderDto, ShoeTypeDto } from "../../services/referenceApi";

export type ProductFormValues = CreateAdminProductPayload;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: ProductFormValues) => Promise<void> | void;
    initial?: AdminProductDto | null;
    genders: GenderDto[];
    shoeTypes: ShoeTypeDto[];
    loadingReferences?: boolean;
    submitting?: boolean;
    errorMessage?: string | null;
};

const DEFAULT_STOCK = 50;

export default function ProductFormModal({
    open,
    onClose,
    onSubmit,
    initial,
    genders,
    shoeTypes,
    loadingReferences = false,
    submitting = false,
    errorMessage = null,
}: Props) {
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [stock, setStock] = useState<number>(DEFAULT_STOCK);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [genderId, setGenderId] = useState<string | undefined>(undefined);
    const [shoeTypeId, setShoeTypeId] = useState<string | undefined>(undefined);
    const [localError, setLocalError] = useState<string | null>(null);

    const genderOptions = useMemo(() => genders, [genders]);
    const shoeTypeOptions = useMemo(() => shoeTypes, [shoeTypes]);

    useEffect(() => {
        if (!open) {
            return;
        }
        if (initial) {
            setSku(initial.sku);
            setName(initial.name);
            setDescription(initial.description);
            setPrice(initial.price);
            setStock(initial.stock);
            setImageUrl(initial.imageUrl ?? "");
            setGenderId(initial.genderId ?? undefined);
            setShoeTypeId(initial.shoeTypeId ?? undefined);
        } else {
            setSku("");
            setName("");
            setDescription("");
            setPrice(0);
            setStock(DEFAULT_STOCK);
            setImageUrl("");
            setGenderId(undefined);
            setShoeTypeId(undefined);
        }
        setLocalError(null);
    }, [initial, open]);

    useEffect(() => {
        if (genderOptions.length === 0 || genderId) return;
        setGenderId(initial?.genderId ?? genderOptions[0]?.id);
    }, [genderOptions, genderId, initial?.genderId]);

    useEffect(() => {
        if (shoeTypeOptions.length === 0 || shoeTypeId) return;
        setShoeTypeId(initial?.shoeTypeId ?? shoeTypeOptions[0]?.id);
    }, [shoeTypeOptions, shoeTypeId, initial?.shoeTypeId]);

    const disableSubmit = submitting || loadingReferences;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLocalError(null);

        if (!sku.trim()) {
            setLocalError("Le SKU est obligatoire");
            return;
        }
        if (!name.trim()) {
            setLocalError("Le nom est obligatoire");
            return;
        }
        if (!description.trim()) {
            setLocalError("La description est obligatoire");
            return;
        }

        try {
            await onSubmit({
                sku: sku.trim(),
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                stock: Number(stock),
                imageUrl: imageUrl.trim() || undefined,
                genderId,
                shoeTypeId,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Une erreur est survenue";
            setLocalError(message);
        }
    };

    return (
        <Modal open={open} onClose={onClose} width={720}>
            <form onSubmit={handleSubmit}>
                <h2 style={{ marginTop: 0 }}>{initial ? "Modifier le produit" : "Ajouter un produit"}</h2>

                <div className="grid2">
                    <label className="field">
                        <span>SKU</span>
                        <input value={sku} onChange={e => setSku(e.target.value)} required disabled={disableSubmit} />
                    </label>
                    <label className="field">
                        <span>Nom</span>
                        <input value={name} onChange={e => setName(e.target.value)} required disabled={disableSubmit} />
                    </label>
                    <label className="field">
                        <span>Description</span>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required disabled={disableSubmit} />
                    </label>
                    <label className="field">
                        <span>Image (URL)</span>
                        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." disabled={disableSubmit} />
                    </label>
                    <label className="field">
                        <span>Prix (€)</span>
                        <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} required disabled={disableSubmit} />
                    </label>
                    <label className="field">
                        <span>Stock</span>
                        <input type="number" min="0" value={stock} onChange={e => setStock(Number(e.target.value))} required disabled={disableSubmit} />
                    </label>
                    <label className="field">
                        <span>Genre</span>
                        <select value={genderId ?? ""} onChange={e => setGenderId(e.target.value || undefined)} disabled={loadingReferences || disableSubmit || genderOptions.length === 0}>
                            {genderOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="field">
                        <span>Type de chaussure</span>
                        <select value={shoeTypeId ?? ""} onChange={e => setShoeTypeId(e.target.value || undefined)} disabled={loadingReferences || disableSubmit || shoeTypeOptions.length === 0}>
                            {shoeTypeOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {(localError || errorMessage) && (
                    <div style={{ color: '#dc2626', marginTop: 8 }}>
                        {localError || errorMessage}
                    </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button type="button" className="btn" onClick={onClose} disabled={submitting}>
                        Annuler
                    </button>
                    <button type="submit" className="btn-solid" disabled={disableSubmit}>
                        {submitting ? "Enregistrement…" : initial ? "Enregistrer" : "Créer"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
