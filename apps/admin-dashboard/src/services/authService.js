// services/authService.js — Admin login / logout

import api from "./api";

export async function loginAdmin({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
}

export async function logoutAdmin(refreshToken) {
    await api.post("/auth/logout", { refreshToken });
}
