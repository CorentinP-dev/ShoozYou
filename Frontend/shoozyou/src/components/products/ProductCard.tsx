import React from "react";
import type { Product } from "../../services/productService";
import { formatPrice } from "../../utils/format";

const labels: Record<Product["category"], string> = {
    homme: "Homme",
    femme: "Femme",
    enfant: "Enfant",
    mixte: "Mixte",
};

type Props = { product: Product; onClick?: (p: Product) => void };

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
    const handle = () => onClick?.(product);

    return (
        <article
            className="product-card"
            role="button"
            tabIndex={0}
            onClick={handle}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handle()}
            aria-label={`Voir ${product.name}`}
        >
            <div className="product-thumb" aria-hidden="true">
                {product.image ? <img src={product.image} alt="" /> : <span className="thumb-fallback">👟</span>}
            </div>
            <div className="product-body">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-meta">
                    <span className={`badge ${product.category}`}>{labels[product.category]}</span>
                </p>
                <p className="product-price">{formatPrice(product.price)}</p>
            </div>
        </article>
    );
};

export default ProductCard;
