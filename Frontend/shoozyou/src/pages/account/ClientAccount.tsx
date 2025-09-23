import { useEffect, useMemo, useState } from "react";
import { RequireRole } from "../../components/routing/RequireRole";
import { useAuth } from "../../context/AuthContext";
import { fetchMyProfile, updateMyProfile, type AccountProfileDto, type UpdateAccountPayload } from "../../services/accountApi";
import { displayOrderStatus, fetchMyOrders, type OrderDto } from "../../services/orderApi";
import { formatPrice } from "../../utils/format";

const initialProfileState = {
    firstName: "",
    lastName: "",
    email: ""
};

type ProfileFormState = typeof initialProfileState & {
    password: string;
};

type Alert = { type: "success" | "error"; message: string } | null;

export default function ClientAccount() {
    const { user, refresh } = useAuth();

    const [profile, setProfile] = useState<AccountProfileDto | null>(null);
    const [form, setForm] = useState<ProfileFormState>({ ...initialProfileState, password: "" });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileAlert, setProfileAlert] = useState<Alert>(null);
    const [profileSaving, setProfileSaving] = useState(false);

    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setProfileLoading(true);
                const result = await fetchMyProfile();
                if (!cancelled) {
                    setProfile(result);
                    setForm({ firstName: result.firstName ?? "", lastName: result.lastName ?? "", email: result.email ?? "", password: "" });
                }
            } catch (err) {
                if (!cancelled) {
                    setProfileAlert({ type: "error", message: err instanceof Error ? err.message : "Impossible de charger votre profil" });
                }
            } finally {
                if (!cancelled) {
                    setProfileLoading(false);
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
        const loadOrders = async () => {
            try {
                setOrdersLoading(true);
                setOrdersError(null);
                const result = await fetchMyOrders();
                if (!cancelled) {
                    setOrders(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setOrdersError(err instanceof Error ? err.message : "Impossible de récupérer vos commandes");
                }
            } finally {
                if (!cancelled) {
                    setOrdersLoading(false);
                }
            }
        };

        loadOrders();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (key: keyof ProfileFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!profile) return;

        const payload: UpdateAccountPayload = {};
        if (form.firstName.trim() && form.firstName.trim() !== profile.firstName) {
            payload.firstName = form.firstName.trim();
        }
        if (form.lastName.trim() && form.lastName.trim() !== profile.lastName) {
            payload.lastName = form.lastName.trim();
        }
        if (form.email.trim() && form.email.trim() !== profile.email) {
            payload.email = form.email.trim();
        }
        if (form.password.trim()) {
            payload.password = form.password.trim();
        }

        if (Object.keys(payload).length === 0) {
            setProfileAlert({ type: "error", message: "Aucune modification à enregistrer." });
            return;
        }

        try {
            setProfileSaving(true);
            const updated = await updateMyProfile(payload);
            setProfile(updated);
            setForm((prev) => ({ ...prev, password: "" }));
            await refresh();
            setProfileAlert({ type: "success", message: "Profil mis à jour avec succès." });
        } catch (err) {
            setProfileAlert({ type: "error", message: err instanceof Error ? err.message : "Impossible de mettre à jour votre profil" });
        } finally {
            setProfileSaving(false);
        }
    };

    const displayName = useMemo(() => {
        const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
        return name || profile?.email || user?.email || "Mon compte";
    }, [profile, user]);

    return (
        <RequireRole>
            <div className="container page">
                <h1 style={{ marginBottom: 8 }}>{displayName}</h1>
                <p style={{ marginBottom: 24, color: "#6b7280" }}>Gérez vos informations personnelles et consultez l'historique de vos commandes.</p>

                <div className="account-grid">
                    <section className="card">
                        <h2>Mes informations</h2>
                        {profileLoading ? (
                            <p>Chargement du profil…</p>
                        ) : !profile ? (
                            <p className="alert-error">{profileAlert?.message ?? "Impossible de charger votre profil."}</p>
                        ) : (
                            <form className="account-form" onSubmit={handleSubmit}>
                                <label className="field">
                                    <span>Prénom</span>
                                    <input value={form.firstName} onChange={handleChange("firstName")} required />
                                </label>
                                <label className="field">
                                    <span>Nom</span>
                                    <input value={form.lastName} onChange={handleChange("lastName")} required />
                                </label>
                                <label className="field">
                                    <span>Email</span>
                                    <input type="email" value={form.email} onChange={handleChange("email")} required />
                                </label>
                                <label className="field">
                                    <span>Nouveau mot de passe</span>
                                    <input type="password" value={form.password} onChange={handleChange("password")} placeholder="Laisser vide pour conserver" minLength={8} />
                                </label>

                                {profileAlert && (
                                    <div className={profileAlert.type === "success" ? "alert-success" : "alert-error"}>
                                        {profileAlert.message}
                                    </div>
                                )}

                                <div className="account-form__actions">
                                    <button type="submit" className="btn-solid" disabled={profileSaving}>
                                        {profileSaving ? "Enregistrement…" : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    <section className="card">
                        <h2>Mes commandes</h2>
                        {ordersLoading ? (
                            <p>Chargement des commandes…</p>
                        ) : ordersError ? (
                            <p className="alert-error">{ordersError}</p>
                        ) : orders.length === 0 ? (
                            <p>Vous n'avez pas encore passé de commande.</p>
                        ) : (
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <article key={order.id} className="order-card">
                                        <header className="order-card__header">
                                            <div>
                                                <div className="order-code">Commande #{order.id.slice(0, 8).toUpperCase()}</div>
                                                <div className="order-date">{new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}</div>
                                            </div>
                                            <span className={`status ${order.status === "PAID" || order.status === "DELIVERED" ? "ok" : order.status === "FAILED" ? "danger" : "warn"}`}>
                                                {displayOrderStatus(order.status)}
                                            </span>
                                        </header>

                                        <div className="order-items">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="order-item">
                                                    <div className="order-thumb">
                                                        {item.product.imageUrl ? (
                                                            <img src={item.product.imageUrl} alt="" />
                                                        ) : (
                                                            <div className="order-thumb__fallback">👟</div>
                                                        )}
                                                    </div>
                                                    <div className="order-item__body">
                                                        <div className="order-item__title">{item.product.name}</div>
                                                        <div className="order-item__meta">SKU {item.product.sku}</div>
                                                    </div>
                                                    <div className="order-item__qty">x{item.quantity}</div>
                                                    <div className="order-item__price">{formatPrice(item.unitPrice * item.quantity)}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <footer className="order-card__footer">
                                            <div>Total</div>
                                            <div className="order-total">{formatPrice(order.total)}</div>
                                        </footer>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </RequireRole>
    );
}
