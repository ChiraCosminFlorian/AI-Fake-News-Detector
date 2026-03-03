// routes/adminRoutes.js
// Purpose: Defines admin-only API endpoints (requires role=admin):
//   GET  /api/admin/stats            → global stats (totalUsers, totalQueries, fake/real ratio)
//   GET  /api/admin/users            → list all users with filtering and pagination
//   PUT  /api/admin/users/:id/disable → disable or re-enable a user account
//   GET  /api/admin/reports          → view user feedback / flagged reports
//   GET  /api/admin/analytics/export → export analytics data as CSV
//   POST /api/admin/retrain          → trigger manual model retraining on ai-inference service
