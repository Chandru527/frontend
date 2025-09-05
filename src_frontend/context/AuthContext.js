import { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("cc_token"));

    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("cc_user");
        const jobSeekerIdStored = localStorage.getItem("cc_jobSeekerId");
        const employerIdStored = localStorage.getItem("cc_employerId");
        const parsed = raw ? JSON.parse(raw) : null;

        if (parsed) {
            return {
                ...parsed,
                jobSeekerId: jobSeekerIdStored ? Number(jobSeekerIdStored) : null,
                employerId: employerIdStored ? Number(employerIdStored) : null,
            };
        }
        return null;
    });

    const login = (jwt, userPayload) => {
        localStorage.setItem("cc_token", jwt);
        localStorage.setItem("cc_user", JSON.stringify(userPayload));
        localStorage.setItem("cc_jobSeekerId", userPayload.jobSeekerId || "");
        localStorage.setItem("cc_employerId", userPayload.employerId || "");
        setToken(jwt);

        const userObject = {
            userId: userPayload.userId || userPayload.id || null,
            id: userPayload.id || userPayload.userId || null,
            username: userPayload.username || userPayload.name || userPayload.email,
            email: userPayload.email,
            roles: userPayload.roles || [],
            jobSeekerId: userPayload.jobSeekerId || null,
            employerId: userPayload.employerId || null,
        };
        setUser(userObject);
    };

    const logout = () => {
        localStorage.removeItem("cc_token");
        localStorage.removeItem("cc_user");
        localStorage.removeItem("cc_jobSeekerId");
        localStorage.removeItem("cc_employerId");
        setToken(null);
        setUser(null);
    };

    const hasRole = (roles = []) =>
        !roles.length || roles.some((r) => user?.roles?.includes(r));

    const value = useMemo(
        () => ({ token, user, login, logout, hasRole }),
        [token, user]
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
