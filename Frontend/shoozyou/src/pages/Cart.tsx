import React from "react";
import { useCart } from "../context/CartContext.tsx";
import { formatPrice } from "../utils/format";

export default function Cart() {
    const { items, subtotal, setQty, remove, clear } = useCart();

    const shipping = items.length > 0 ? 6.9 : 0;
    const total = subtotal + shipping;

    return (
        <div className="container page">
            <h1>Panier</h1>

            {items.length === 0 ? (
                <p>Votre panier est vide.</p>
            ) : (
                <div className="cart-grid">
                    <div className="cart-list">
                        {items.map((it) => (
                            <div key={`${it.id}__${it.size ?? ""}`} className="cart-row">
                                <div className="cart-thumb">
                                    {it.image ? <img src={it.image} alt="" /> : <div className="thumb-fallback">👟</div>}
                                </div>
                                <div className="cart-info">
                                    <div className="cart-title">{it.name}</div>
                                    {it.size != null && <div className="cart-sub">Taille : {it.size}</div>}
                                    <button className="cart-remove" onClick={() => remove(it.id, it.size)}>Retirer</button>
                                </div>
                                <div className="cart-qty">
                                    <label className="sr-only" htmlFor={`q-${it.id}${it.size ?? ""}`}>Quantité</label>
                                    <select
                                        id={`q-${it.id}${it.size ?? ""}`}
                                        value={it.quantity}
                                        onChange={(e) => setQty(it.id, it.size, Number(e.target.value))}
                                    >
                                        {Array.from({ length: 10 }).map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                                    </select>
                                </div>
                                <div className="cart-price">{formatPrice(it.price * it.quantity)}</div>
                            </div>
                        ))}
                        {/* ...dans la <div className="cart-list">, après les lignes du panier */}
                        <div className="cart-footer">
                            <button className="btn-outline-danger" onClick={clear}>
                                Vider le panier
                            </button>
                        </div>

                    </div>

                    <aside className="cart-summary">
                        <h2>Récapitulatif</h2>
                        <div className="sum-row"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
                        <div className="sum-row"><span>Livraison</span><span>{formatPrice(shipping)}</span></div>
                        <div className="sum-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
                        <button className="btn-solid" onClick={() => alert("Paiement fictif 🙂")}>Payer</button>
                    </aside>
                </div>
            )}
        </div>
    );
}
