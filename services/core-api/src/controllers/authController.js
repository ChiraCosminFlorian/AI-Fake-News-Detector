// src/controllers/authController.js
// Purpose: Authentication logic — register, login, refresh, logout

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    deleteRefreshToken,
} = require("../services/tokenService");

// ── POST /api/auth/register ────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Create user (password is hashed by the pre-save hook in User model)
        const user = await User.create({ name, email, password });

        // Placeholder for email verification (to be replaced with real email service)
        console.log(`[EMAIL] Verification email would be sent to: ${email}`);

        res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            userId: user._id,
        });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/auth/login ───────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user and explicitly select the password field
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if account is disabled by admin
        if (!user.isActive) {
            return res.status(403).json({ error: "Account has been disabled" });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Persist refresh token in DB
        await saveRefreshToken(user._id, refreshToken);

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/auth/refresh ─────────────────────────────────
exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        // Check if the token exists in DB
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }

        // Verify the JWT signature & expiry
        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            // Token is invalid or expired — remove it from DB
            await deleteRefreshToken(refreshToken);
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }

        // Fetch user to get current role (may have changed since token was issued)
        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) {
            await deleteRefreshToken(refreshToken);
            return res.status(401).json({ error: "User not found or account disabled" });
        }

        // Issue a fresh access token
        const accessToken = generateAccessToken(user);

        res.json({ accessToken });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/auth/logout ──────────────────────────────────
exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        // Delete from DB — session is terminated
        await deleteRefreshToken(refreshToken);

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};
