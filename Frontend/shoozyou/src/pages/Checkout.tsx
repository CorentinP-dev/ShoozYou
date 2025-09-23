import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { submitCheckout } from "../services/orderApi";
import type { CheckoutAddress, CheckoutPaymentMethod } from "../services/orderApi";

const createEmptyAddress = (): CheckoutAddress => ({
    fullName: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "France",
    phone: "",
});

const createEmptyPayment = (): CheckoutPaymentMethod => ({
    cardholderName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
});

export default function Checkout() {
    const { items, subtotal, clear } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (items.length === 0) {
            navigate("/cart", { replace: true });
        }
    }, [items.length, navigate]);

    const [shipping, setShipping] = useState<CheckoutAddress>(createEmptyAddress);
    const [useBillingSame, setUseBillingSame] = useState(true);
    const [billing, setBilling] = useState<CheckoutAddress>(createEmptyAddress);
    const [payment, setPayment] = useState<CheckoutPaymentMethod>(createEmptyPayment);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ orderId: string; status: string } | null>(null);

    const totalQuantity = useMemo(() => items.reduce((n, item) => n + item.quantity, 0), [items]);

    const updateShipping = (key: keyof CheckoutAddress, value: string) =>
        setShipping((prev) => ({ ...prev, [key]: value }));

    const updateBilling = (key: keyof CheckoutAddress, value: string) =>
        setBilling((prev) => ({ ...prev, [key]: value }));

    const updatePayment = (key: keyof CheckoutPaymentMethod, value: string) =>
        setPayment((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (items.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const response = await submitCheckout({
                items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
                paymentProvider: "CARD",
                shippingAddress: shipping,
                billingAddress: useBillingSame ? undefined : billing,
                paymentMethod: payment,
            });

            clear();
            setSuccess({ orderId: response.orderId, status: response.orderStatus });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible de finaliser la commande.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container page checkout-page">
            <h1>Finaliser la commande</h1>

            {success ? (
                <div className="checkout-success">
                    <h2>Merci pour votre achat !</h2>
                    <p>
                        Votre commande <strong>#{success.orderId.slice(0, 8).toUpperCase()}</strong> est en statut
                        <strong> {success.status}</strong>.
                    </p>
                    <p>
                        Vous pouvez retrouver le détail dans <a href="/account">votre espace client</a>.
                    </p>
                    <button className="btn-solid" onClick={() => navigate("/products")}>Retour à la boutique</button>
                </div>
            ) : (
                <form className="checkout-grid" onSubmit={handleSubmit}>
                    <section className="checkout-card">
                        <h2>Adresse de livraison</h2>
                        <div className="checkout-form-grid">
                            <label className="field">
                                <span>Nom complet</span>
                                <input value={shipping.fullName} onChange={(e) => updateShipping("fullName", e.target.value)} required />
                            </label>
                            <label className="field">
                                <span>Téléphone</span>
                                <input value={shipping.phone} onChange={(e) => updateShipping("phone", e.target.value)} required />
                            </label>
                            <label className="field">
                                <span>Adresse</span>
                                <input value={shipping.line1} onChange={(e) => updateShipping("line1", e.target.value)} required />
                            </label>
                            <label className="field">
                                <span>Complément</span>
                                <input value={shipping.line2 ?? ""} onChange={(e) => updateShipping("line2", e.target.value)} placeholder="Bâtiment, étage..." />
                            </label>
                            <label className="field">
                                <span>Code postal</span>
                                <input value={shipping.postalCode} onChange={(e) => updateShipping("postalCode", e.target.value)} required />
                            </label>
                            <label className="field">
                                <span>Ville</span>
                                <input value={shipping.city} onChange={(e) => updateShipping("city", e.target.value)} required />
                            </label>
                            <label className="field">
                                <span>Pays</span>
                                <input value={shipping.country} onChange={(e) => updateShipping("country", e.target.value)} required />
                            </label>
                        </div>
                    </section>

                    <section className="checkout-card">
                        <div className="billing-header">
                            <h2>Adresse de facturation</h2>
                            <label className="checkbox-inline">
                                <input
                                    type="checkbox"
                                    checked={useBillingSame}
                                    onChange={(e) => setUseBillingSame(e.target.checked)}
                                />
                                Identique à la livraison
                            </label>
                        </div>
                        {!useBillingSame && (
                            <div className="checkout-form-grid">
                                <label className="field">
                                    <span>Nom complet</span>
                                    <input value={billing.fullName} onChange={(e) => updateBilling("fullName", e.target.value)} required />
                                </label>
                                <label className="field">
                                    <span>Téléphone</span>
                                    <input value={billing.phone} onChange={(e) => updateBilling("phone", e.target.value)} required />
                                </label>
                                <label className="field">
                                    <span>Adresse</span>
                                    <input value={billing.line1} onChange={(e) => updateBilling("line1", e.target.value)} required />
                                </label>
                                <label className="field">
                                    <span>Complément</span>
                                    <input value={billing.line2 ?? ""} onChange={(e) => updateBilling("line2", e.target.value)} placeholder="Bâtiment, étage..." />
                                </label>
                                <label className="field">
                                    <span>Code postal</span>
                                    <input value={billing.postalCode} onChange={(e) => updateBilling("postalCode", e.target.value)} required />
                                </label>
                                <label className="field">
                                    <span>Ville</span>
                                    <input value={billing.city} onChange={(e) => updateBilling("city", e.target.value)} required />
                                </label>
                                <label className="field">
                                    <span>Pays</span>
                                    <input value={billing.country} onChange={(e) => updateBilling("country", e.target.value)} required />
                                </label>
                            </div>
                        )}
                    </section>

                    <section className="checkout-card">
                        <h2>Paiement</h2>
                        <div className="checkout-form-grid payment-grid">
                            <label className="field">
                                <span>Nom sur la carte</span>
                                <input value={payment.cardholderName} onChange={(e) => updatePayment("cardholderName", e.target.value)} required />
                            </label>
                            <label className="field">
                                <span>Numéro de carte</span>
                                <input
                                    value={payment.cardNumber}
                                    onChange={(e) => updatePayment("cardNumber", e.target.value)}
                                    placeholder="4242 4242 4242 4242"
                                    required
                                />
                            </label>
                            <label className="field">
                                <span>Mois d'expiration</span>
                                <input
                                    value={payment.expMonth}
                                    onChange={(e) => updatePayment("expMonth", e.target.value)}
                                    placeholder="MM"
                                    required
                                />
                            </label>
                            <label className="field">
                                <span>Année d'expiration</span>
                                <input
                                    value={payment.expYear}
                                    onChange={(e) => updatePayment("expYear", e.target.value)}
                                    placeholder="AA"
                                    required
                                />
                            </label>
                            <label className="field">
                                <span>CVC</span>
                                <input
                                    value={payment.cvc}
                                    onChange={(e) => updatePayment("cvc", e.target.value)}
                                    placeholder="123"
                                    required
                                />
                            </label>
                        </div>
                    </section>

                    <aside className="checkout-summary">
                        <h2>Récapitulatif</h2>
                        <div className="summary-line">
                            <span>Articles</span>
                            <span>{totalQuantity}</span>
                        </div>
                        <div className="summary-line">
                            <span>Sous-total</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Livraison</span>
                            <span>{formatPrice(totalQuantity > 0 ? 6.9 : 0)}</span>
                        </div>
                        <div className="summary-line total">
                            <span>Total</span>
                            <span>{formatPrice(subtotal + (totalQuantity > 0 ? 6.9 : 0))}</span>
                        </div>

                        {error && <div className="alert-error">{error}</div>}

                        <button className="btn-solid" type="submit" disabled={loading || items.length === 0}>
                            {loading ? "Traitement..." : "Valider et payer"}
                        </button>
                    </aside>
                </form>
            )}
        </div>
    );
}
