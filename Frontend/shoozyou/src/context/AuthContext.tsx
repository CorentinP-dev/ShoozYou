import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    getStoredSession,
    login as svcLogin,
    logout as svcLogout,
    refreshSession,
    type AuthUser
} from "../services/authService";

type AuthContextType = {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => getStoredSession());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            try {
                const session = await refreshSession();
                if (!cancelled) {
                    setUser(session);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        init();
        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (email: string, password: string) => {
        const session = await svcLogin(email, password);
        setUser(session);
    };

    const logout = () => {
        svcLogout();
        setUser(null);
    };

    const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
