// src/app.js
// Purpose: Express application entry point
//   - Loads environment variables
//   - Connects to MongoDB
//   - Mounts global middleware (CORS, JSON, rate-limiting)
//   - Mounts route placeholders (to be added later)
//   - Registers the global error handler

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// ── Security & parsing ─────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
        credentials: true, // allow cookies (refresh token)
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ── Global rate limiter ────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ── Health check ───────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "core-api" });
});

// ── Routes (will be added in next steps) ───────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/predictions", require("./routes/predictionRoutes"));
// app.use("/api/admin",     require("./routes/adminRoutes"));

// ── 404 catch-all ──────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    res.status(status).json({
        error: err.message || "Internal server error",
    });
});

// ── Start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Core API running on port ${PORT}`);
    });
});

module.exports = app;
