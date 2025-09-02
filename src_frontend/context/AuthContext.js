import { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("cc_token"));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("cc_user");
        return raw ? JSON.parse(raw) : null;
    });

    const login = (jwt, userPayload) => {
        localStorage.setItem("cc_token", jwt);
        localStorage.setItem("cc_user", JSON.stringify(userPayload));
        setToken(jwt);
        setUser({
            username: userPayload.username || userPayload.name || userPayload.email,
            roles: userPayload.roles
        });
    };

    const logout = () => {
        localStorage.removeItem("cc_token");
        localStorage.removeItem("cc_user");
        setToken(null);
        setUser(null);
    };

    const hasRole = (roles = []) => {
        if (!roles.length) return true;
        const r = user?.roles || [];
        return roles.some(role => r.includes(role));
    };

    const value = useMemo(() => ({ token, user, login, logout, hasRole }), [token, user]);
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
