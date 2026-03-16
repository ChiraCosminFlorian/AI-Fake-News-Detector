// src/controllers/authController.js
// Purpose: Authentication logic — register, login, refresh, logout, verifyEmail

const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    deleteRefreshToken,
} = require("../services/tokenService");

const getResend = () => new Resend(process.env.RESEND_API_KEY);

// ── POST /api/auth/register ────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Create user (password is hashed by the pre-save hook in User model)
        const user = await User.create({
            name,
            email,
            password,
            isVerified: false,
            verificationToken,
        });

        // Send verification email via Resend
        const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;
        try {
            await resend.emails.send({
                from: process.env.FROM_EMAIL || "FakeScope <noreply@fakescope.com>",
                to: email,
                subject: "Verify your FakeScope account",
                html: `
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                        <h2 style="color: #4f46e5;">Welcome to FakeScope!</h2>
                        <p>Hi ${name},</p>
                        <p>Click the button below to verify your email address:</p>
                        <a href="${verifyUrl}"
                           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                                  border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                            Verify Email
                        </a>
                        <p style="color: #6b7280; font-size: 14px;">
                            Or copy this link: <br/>
                            <a href="${verifyUrl}" style="color: #4f46e5;">${verifyUrl}</a>
                        </p>
                    </div>
                `,
            });
            console.log(`[EMAIL] Verification email sent to: ${email}`);
        } catch (emailErr) {
            console.error(`[EMAIL] Failed to send verification email:`, emailErr.message);
        }

        res.status(201).json({
            message: "Account created! Please check your email to verify your account.",
            userId: user._id,
        });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/auth/verify-email/:token ─────────────────────
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired verification link" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: "Email verified successfully! You can now sign in." });
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

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({ error: "Please verify your email first" });
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
