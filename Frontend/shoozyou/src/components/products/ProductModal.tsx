import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import type { Product } from "../../services/productService";
import { useCart } from "../../context/CartContext.tsx";
import { formatPrice } from "../../utils/format";

type Props = {
    open: boolean;
    product: Product | null;
    onClose: () => void;
};

const fallbackSizesForCategory = (cat: Product["category"]) => {
    switch (cat) {
        case "homme":
            return ['40', '41', '42', '43', '44', '45', '46'];
        case "femme":
            return ['36', '37', '38', '39', '40', '41'];
        case "enfant":
            return ['27', '28', '29', '30', '31', '32', '33', '34'];
        default:
            return ['36', '37', '38', '39', '40', '41', '42', '43'];
    }
};

const categoryLabels: Record<Product["category"], string> = {
    homme: "Homme",
    femme: "Femme",
    enfant: "Enfant",
    mixte: "Mixte",
};

export default function ProductModal({ open, product, onClose }: Props) {
    const { add } = useCart();
    const [size, setSize] = useState<string | null>(null);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        if (open) {
            setQty(1);
            setSize(null);
        }
    }, [open]);

    const sizeOptions = useMemo(() => {
        if (!product) return [];
        if (product.variants.length) {
            return product.variants.map(variant => ({
                id: variant.id,
                value: variant.sizeValue,
                label: variant.sizeLabel,
                stock: variant.stock,
            }));
        }
        return fallbackSizesForCategory(product.category).map(value => ({
            id: value,
            value,
            label: `${value} EU`,
            stock: product.stock,
        }));
    }, [product]);

    if (!product) return null;

    const selectedInfo = size ? sizeOptions.find(item => item.value === size) : undefined;
    const isAddDisabled = (sizeOptions.length > 0 && size === null) || (selectedInfo && selectedInfo.stock === 0);

    const handleAdd = () => {
        if (isAddDisabled) return;
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
                    <div className="pmodal-tag">{categoryLabels[product.category]}</div>
                    <div className="pmodal-price">{formatPrice(product.price)}</div>
                    <p className="pmodal-desc">{product.description || "Parfaites pour un style quotidien. Confort et durabilité 💫"}</p>

                    <div className="pmodal-block">
                        <div className="pmodal-label">Taille</div>
                        <div className="size-grid">
                            {sizeOptions.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`size-btn${option.value === size ? " selected" : ""}${option.stock === 0 ? " disabled" : ""}`}
                                    onClick={() => option.stock > 0 && setSize(option.value)}
                                >
                                    <span className="size-top">{option.label}</span>
                                    <span className="size-bottom">{option.stock > 0 ? `${option.stock} en stock` : "Rupture"}</span>
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
                        disabled={isAddDisabled}
                        onClick={handleAdd}
                    >
                        Ajouter au panier
                    </button>
                </div>
            </div>
        </Modal>
    );
}
