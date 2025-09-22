// Mini service d'auth côté front (localStorage). Remplace par un vrai backend plus tard.

export type Role = "admin" | "seller" | "client";

export type AuthUser = {
    id: string;
    name: string;
    role: Role;
    email: string;
    token: string;
};

const STORAGE_KEY = "auth-user-v1";

export function login(email: string, _password: string, role: Role): Promise<AuthUser> {
    // → MOCK : accepte tout, génère un user. À remplacer par un appel API réel.
    return new Promise((resolve) => {
        const user: AuthUser = {
            id: crypto.randomUUID(),
            name: email.split("@")[0] || "Utilisateur",
            role,
            email,
            token: crypto.randomUUID(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        resolve(user);
    });
}

export function logout(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): AuthUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}
