// src/services/tokenService.js
// Purpose: JWT generation, refresh-token persistence, and cleanup

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ── Helpers to parse duration strings (e.g. "7d") to ms ────
function durationToMs(dur) {
    const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const match = dur.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 86_400_000; // fallback 7 days
    return parseInt(match[1], 10) * units[match[2]];
}

/**
 * Generate a short-lived JWT access token.
 * Payload carries userId and role for RBAC checks.
 */
function generateAccessToken(user) {
    return jwt.sign(
        { userId: user._id, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

/**
 * Generate a cryptographically random refresh token,
 * sign it as a JWT so we can verify integrity later.
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { userId: user._id, jti: crypto.randomUUID() },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

/**
 * Persist a refresh token in MongoDB.
 * The TTL index on expiresAt will auto-clean expired rows.
 */
async function saveRefreshToken(userId, token) {
    const expiresAt = new Date(Date.now() + durationToMs(REFRESH_EXPIRES_IN));
    await RefreshToken.create({ token, userId, expiresAt });
}

/**
 * Delete a specific refresh token from the DB (used on logout).
 */
async function deleteRefreshToken(token) {
    await RefreshToken.deleteOne({ token });
}

/**
 * Delete ALL refresh tokens for a user (e.g. "log out everywhere").
 */
async function deleteAllUserTokens(userId) {
    await RefreshToken.deleteMany({ userId });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    deleteRefreshToken,
    deleteAllUserTokens,
};
