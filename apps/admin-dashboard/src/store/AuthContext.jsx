// store/AuthContext.jsx — Admin auth state

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { loginAdmin, logoutAdmin } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const s = localStorage.getItem("admin_user");
        return s ? JSON.parse(s) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("admin_accessToken"));
    const isAuthenticated = !!token && user?.role === "admin";

    useEffect(() => {
        if (user) localStorage.setItem("admin_user", JSON.stringify(user));
        else localStorage.removeItem("admin_user");
    }, [user]);

    const login = useCallback(async (email, password) => {
        const data = await loginAdmin({ email, password });
        if (data.user.role !== "admin") throw new Error("Admin access required");
        localStorage.setItem("admin_accessToken", data.accessToken);
        localStorage.setItem("admin_refreshToken", data.refreshToken);
        setToken(data.accessToken);
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            const rt = localStorage.getItem("admin_refreshToken");
            if (rt) await logoutAdmin(rt);
        } catch { /* ignore */ }
        localStorage.removeItem("admin_accessToken");
        localStorage.removeItem("admin_refreshToken");
        localStorage.removeItem("admin_user");
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
