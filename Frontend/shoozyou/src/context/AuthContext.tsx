import React, { createContext, useContext, useMemo, useState } from "react";
import type { Role } from "../services/authService";
import { getCurrentUser, login as svcLogin, logout as svcLogout, type AuthUser } from "../services/authService";

type AuthContextType = {
    user: AuthUser | null;
    login: (email: string, password: string, role: Role) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

    const login = async (email: string, password: string, role: Role) => {
        const u = await svcLogin(email, password, role);
        setUser(u);
    };

    const logout = () => {
        svcLogout();
        setUser(null);
    };

    const value = useMemo(() => ({ user, login, logout }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
