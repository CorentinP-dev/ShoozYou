import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../services/authService";

export const RequireRole: React.FC<{ roles?: Role[]; children: React.ReactNode }> = ({ roles, children }) => {
    const { user } = useAuth();
    const loc = useLocation();

    if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

    if (roles && !roles.includes(user.role)) {
        // non autorisé → on renvoie à l'accueil (ou autre)
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};
