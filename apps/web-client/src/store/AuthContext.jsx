// store/AuthContext.jsx
// Purpose: Global auth state — token storage, login/logout, user info

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { loginUser, logoutUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
    const isAuthenticated = !!token;

    // Sync user state with localStorage
    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
    }, [user]);

    const login = useCallback(async (email, password) => {
        const data = await loginUser({ email, password });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const data = await registerUser({ name, email, password });
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) await logoutUser(refreshToken);
        } catch {
            // ignore — still clear local state
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    const value = { user, token, isAuthenticated, login, register, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
