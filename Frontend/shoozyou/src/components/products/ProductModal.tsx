import React, { useMemo, useState } from "react";
import Modal from "../ui/Modal";
import type { Product } from "../../services/productService";
import { useCart } from "../../context/CartContext.tsx";
import { formatPrice } from "../../utils/format";

type Props = {
    open: boolean;
    product: Product | null;
    onClose: () => void;
};

const sizesForCategory = (cat: Product["category"]) => {
    switch (cat) {
        case "homme": return [40, 41, 42, 43, 44, 45, 46];
        case "femme": return [36, 37, 38, 39, 40, 41];
        default:      return [27, 28, 29, 30, 31, 32, 33, 34];
    }
};

export default function ProductModal({ open, product, onClose }: Props) {
    const { add } = useCart();
    const [size, setSize] = useState<number | null>(null);
    const [qty, setQty] = useState(1);

    // reset à l'ouverture
    React.useEffect(() => { if (open) { setQty(1); setSize(null); } }, [open]);

    const sizes = useMemo(() => product ? sizesForCategory(product.category) : [], [product]);

    if (!product) return null;

    const handleAdd = () => {
        add({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size ?? undefined,
            quantity: qty,
        });
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} width={980}>
            <div className="pmodal">
                <div className="pmodal-media">
                    {product.image ? <img src={product.image} alt="" /> : <div className="pmodal-fallback">👟</div>}
                </div>

                <div className="pmodal-body">
                    <h2 className="pmodal-title">{product.name}</h2>
                    <div className="pmodal-price">{formatPrice(product.price)}</div>
                    <p className="pmodal-desc">Parfaites pour un style quotidien. Confort et durabilité 💫</p>

                    <div className="pmodal-block">
                        <div className="pmodal-label">Taille</div>
                        <div className="size-grid">
                            {sizes.map(s => (
                                <button
                                    key={s}
                                    className={"size-btn" + (s === size ? " selected" : "")}
                                    onClick={() => setSize(s)}
                                >
                                    <span className="size-top">{s}</span>
                                    <span className="size-bottom">stock</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pmodal-block">
                        <label className="pmodal-label" htmlFor="qty">Quantité</label>
                        <select
                            id="qty"
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                            className="qty-select"
                        >
                            {Array.from({ length: 10 }).map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                        </select>
                    </div>

                    <button
                        className="btn-solid"
                        disabled={sizes.length > 0 && size === null}
                        onClick={handleAdd}
                    >
                        Ajouter au panier
                    </button>
                </div>
            </div>
        </Modal>
    );
}
