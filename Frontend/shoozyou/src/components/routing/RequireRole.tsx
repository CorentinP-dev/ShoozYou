import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../services/authService";

export const RequireRole: React.FC<{ roles?: Role[]; children: React.ReactNode }> = ({ roles, children }) => {
    const { user, loading } = useAuth();
    const loc = useLocation();

    if (loading) {
        return <div style={{ padding: 20 }}>Chargement…</div>;
    }

    if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};
