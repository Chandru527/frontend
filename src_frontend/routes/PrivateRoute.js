import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ roles = [] }) {
    const { token, hasRole } = useAuth();
    const loc = useLocation();

    if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
    if (roles.length && !hasRole(roles)) return <Navigate to="/" replace />;

    return <Outlet />;
}
