// services/api.js — Axios instance for admin dashboard

import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const orig = error.config;
        if (error.response?.status === 401 && !orig._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    orig.headers.Authorization = `Bearer ${token}`;
                    return api(orig);
                });
            }
            orig._retry = true;
            isRefreshing = true;
            try {
                const rt = localStorage.getItem("admin_refreshToken");
                if (!rt) throw new Error("No refresh token");
                const { data } = await axios.post("/api/auth/refresh", { refreshToken: rt });
                localStorage.setItem("admin_accessToken", data.accessToken);
                processQueue(null, data.accessToken);
                orig.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(orig);
            } catch (e) {
                processQueue(e);
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
