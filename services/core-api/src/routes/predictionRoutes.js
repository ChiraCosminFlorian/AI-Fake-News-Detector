// src/routes/predictionRoutes.js
// Purpose: Mount prediction endpoints under /api/predictions
// All routes require a valid access token.

const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const predictionController = require("../controllers/predictionController");

// Every route below requires authentication
router.use(verifyAccessToken);

// POST /api/predictions/analyze-text  → classify plain text
router.post("/analyze-text", predictionController.analyzeText);

// POST /api/predictions/analyze-url   → fetch URL, extract text, classify
router.post("/analyze-url", predictionController.analyzeUrl);

// GET  /api/predictions/history       → paginated + filtered past predictions
router.get("/history", predictionController.getHistory);

// PATCH /api/predictions/:id/bookmark → toggle bookmark flag
router.patch("/:id/bookmark", predictionController.toggleBookmark);

// POST  /api/predictions/:id/feedback → submit agree/disagree
router.post("/:id/feedback", predictionController.submitFeedback);

module.exports = router;
