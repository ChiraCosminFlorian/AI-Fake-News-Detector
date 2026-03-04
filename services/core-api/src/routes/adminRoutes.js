// src/routes/adminRoutes.js
// Purpose: Mount admin-only endpoints under /api/admin
// All routes require authentication + admin role.

const express = require("express");
const router = express.Router();
const { verifyAccessToken, verifyAdmin } = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");

// Every route below requires auth + admin role
router.use(verifyAccessToken, verifyAdmin);

// GET  /api/admin/stats           → global platform statistics
router.get("/stats", adminController.getGlobalStats);

// GET  /api/admin/fake-real-ratio → daily fake vs real for last 30 days
router.get("/fake-real-ratio", adminController.getFakeRealRatio);

// GET  /api/admin/top-keywords    → top 30 keywords from fake predictions
router.get("/top-keywords", adminController.getTopKeywords);

// GET  /api/admin/users           → paginated user list with prediction counts
router.get("/users", adminController.getUsers);

// PATCH /api/admin/users/:id/status → enable or disable a user
router.patch("/users/:id/status", adminController.toggleUserStatus);

// GET  /api/admin/reports         → user feedback on predictions
router.get("/reports", adminController.getReports);

// GET  /api/admin/export-csv      → download predictions as CSV
router.get("/export-csv", adminController.exportAnalyticsCsv);

module.exports = router;
