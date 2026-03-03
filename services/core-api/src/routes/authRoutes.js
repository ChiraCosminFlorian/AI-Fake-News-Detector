// routes/authRoutes.js
// Purpose: Defines auth API endpoints:
//   POST /api/auth/register
//   POST /api/auth/verify-email
//   POST /api/auth/login          → returns accessToken (15min) + sets refresh cookie (7d)
//   POST /api/auth/refresh        → issues new accessToken using refresh cookie
//   POST /api/auth/logout         → deletes refresh token from DB + clears cookie
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password
