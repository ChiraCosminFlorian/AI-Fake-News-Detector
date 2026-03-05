// services/adminService.js — Calls to /api/admin/* endpoints

import api from "./api";

export const getGlobalStats = () => api.get("/admin/stats").then((r) => r.data);

export const getFakeRealRatio = () => api.get("/admin/fake-real-ratio").then((r) => r.data);

export const getTopKeywords = () => api.get("/admin/top-keywords").then((r) => r.data);

export const getUsers = (params) => api.get("/admin/users", { params }).then((r) => r.data);

export const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/status`).then((r) => r.data);

export const getReports = (params) => api.get("/admin/reports", { params }).then((r) => r.data);

export const exportCsv = (params) =>
    api.get("/admin/export-csv", { params, responseType: "blob" }).then((r) => r.data);
