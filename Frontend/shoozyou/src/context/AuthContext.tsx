import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
    getStoredSession,
    login as svcLogin,
    logout as svcLogout,
    refreshSession,
    register as svcRegister,
    type AuthUser,
    type RegisterPayload
} from "../services/authService";

type AuthContextType = {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    refresh: () => Promise<void>;
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

    const login = useCallback(async (email: string, password: string) => {
        const session = await svcLogin(email, password);
        setUser(session);
    }, []);

    const register = useCallback(async (payload: RegisterPayload) => {
        const session = await svcRegister(payload);
        setUser(session);
    }, []);

    const logout = useCallback(() => {
        svcLogout();
        setUser(null);
    }, []);

    const refresh = useCallback(async () => {
        const session = await refreshSession();
        setUser(session);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, register, logout, refresh }),
        [user, loading, login, register, logout, refresh]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
