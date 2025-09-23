import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login, loading, user } = useAuth();
    const navigate = useNavigate();
    const loc = useLocation() as { state?: { from?: string } };

    const [email, setEmail] = useState("admin@shoozyou.com");
    const [password, setPassword] = useState("Admin123!456");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && !loading) {
            const fallback = user.role === "admin" ? "/admin" : user.role === "seller" ? "/seller" : "/";
            navigate(loc.state?.from || fallback, { replace: true });
        }
    }, [user, loading, navigate, loc.state]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Identifiants invalides");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-wrap container page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Connexion</h1>
                <p className="muted">Connectez-vous pour accéder à votre espace.</p>

                <label className="field">
                    <span>Email</span>
                    <input
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label className="field">
                    <span>Mot de passe</span>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                {error && <div className="auth-error">{error}</div>}

                <button className="btn-solid" type="submit" disabled={submitting}>
                    {submitting ? "Connexion..." : "Se connecter"}
                </button>

                <p className="muted" style={{ marginTop: 16 }}>
                    Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                </p>
            </form>
        </div>
    );
}
