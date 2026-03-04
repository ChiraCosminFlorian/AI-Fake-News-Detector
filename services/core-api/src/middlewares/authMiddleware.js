// src/middlewares/authMiddleware.js
// Purpose: JWT verification and role-based access control middleware

const jwt = require("jsonwebtoken");

/**
 * verifyAccessToken
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to req.user.
 */
const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access token is required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded; // { userId, role, iat, exp }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired access token" });
    }
};

/**
 * verifyAdmin
 * Must be used AFTER verifyAccessToken.
 * Checks that the authenticated user has the "admin" role.
 */
const verifyAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

module.exports = { verifyAccessToken, verifyAdmin };
