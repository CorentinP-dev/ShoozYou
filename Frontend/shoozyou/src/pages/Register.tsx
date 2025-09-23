import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const initialState: FormState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
};

export default function Register() {
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>(initialState);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await register({
                email: form.email.trim(),
                password: form.password,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
            });
            navigate("/account", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible de créer le compte");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-wrap container page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Créer un compte</h1>
                <p className="muted">Rejoignez ShoozYou pour profiter de nos offres.</p>

                <div className="grid2">
                    <label className="field">
                        <span>Prénom</span>
                        <input
                            value={form.firstName}
                            onChange={handleChange("firstName")}
                            placeholder="Camille"
                            required
                        />
                    </label>
                    <label className="field">
                        <span>Nom</span>
                        <input
                            value={form.lastName}
                            onChange={handleChange("lastName")}
                            placeholder="Client"
                            required
                        />
                    </label>
                </div>

                <label className="field">
                    <span>Email</span>
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="vous@exemple.com"
                        required
                    />
                </label>

                <label className="field">
                    <span>Mot de passe</span>
                    <input
                        type="password"
                        value={form.password}
                        onChange={handleChange("password")}
                        placeholder="Au moins 8 caractères"
                        minLength={8}
                        required
                    />
                </label>

                {error && <div className="auth-error">{error}</div>}

                <button className="btn-solid" type="submit" disabled={submitting || loading}>
                    {submitting ? "Création..." : "Créer le compte"}
                </button>

                <p className="muted" style={{ marginTop: 16 }}>
                    Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
                </p>
            </form>
        </div>
    );
}
