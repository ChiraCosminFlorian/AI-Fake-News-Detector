// services/authService.js
// Purpose: Auth API calls — register, login, logout, refresh

import api from "./api";

export async function registerUser({ name, email, password }) {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
}

export async function loginUser({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password });
    return data; // { accessToken, refreshToken, user }
}

export async function logoutUser(refreshToken) {
    await api.post("/auth/logout", { refreshToken });
}

export async function refreshAccessToken(refreshToken) {
    const { data } = await api.post("/auth/refresh", { refreshToken });
    return data; // { accessToken }
}
