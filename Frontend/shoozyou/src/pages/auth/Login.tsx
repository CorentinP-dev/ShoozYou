import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../services/authService";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const loc = useLocation() as any;

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [role, setRole] = useState<Role>("client");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
            await login(email || "client@shoozyou.com", pwd || "pass", role);
            const fallback = role === "seller" ? "/seller" : role === "admin" ? "/admin" : "/";
            navigate((loc.state && loc.state.from) || fallback, { replace: true });
        } catch {
            setErr("Identifiants invalides");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrap container page">
            <form className="auth-card" onSubmit={onSubmit}>
                <h1>Connexion</h1>
                <p className="muted">Connectez-vous selon votre rôle pour accéder à votre espace.</p>

                <label className="field">
                    <span>Email</span>
                    <input type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>

                <label className="field">
                    <span>Mot de passe</span>
                    <input type="password" placeholder="••••••••" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                </label>

                <label className="field">
                    <span>Rôle</span>
                    <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                        <option value="client">Client</option>
                        <option value="seller">Vendeur</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>

                {err && <div className="auth-error">{err}</div>}

                <button className="btn-solid" type="submit" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
}
