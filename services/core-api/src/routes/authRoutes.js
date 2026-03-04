// src/routes/authRoutes.js
// Purpose: Mount authentication endpoints under /api/auth

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/register  → create account
router.post("/register", authController.register);

// POST /api/auth/login     → returns accessToken + refreshToken
router.post("/login", authController.login);

// POST /api/auth/refresh   → returns new accessToken
router.post("/refresh", authController.refresh);

// POST /api/auth/logout    → deletes refresh token from DB
router.post("/logout", authController.logout);

module.exports = router;
