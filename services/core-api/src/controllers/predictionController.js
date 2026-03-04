// src/controllers/predictionController.js
// Purpose: Prediction CRUD — analyze, history, bookmarks, feedback

const axios = require("axios");
const Prediction = require("../models/Prediction");
const { callAiService } = require("../services/aiService");

// ── POST /api/predictions/analyze-text ─────────────────────
exports.analyzeText = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Text is required" });
        }

        // Call FastAPI AI service
        const { label, confidence } = await callAiService(text);

        // Persist prediction
        const prediction = await Prediction.create({
            userId: req.user.userId,
            text,
            label,
            confidence,
        });

        res.status(201).json({
            id: prediction._id,
            label,
            confidence,
            createdAt: prediction.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/predictions/analyze-url ──────────────────────
exports.analyzeUrl = async (req, res, next) => {
    try {
        const { url } = req.body;

        if (!url || !url.trim()) {
            return res.status(400).json({ error: "URL is required" });
        }

        // Fetch article content from URL
        let articleText;
        try {
            const response = await axios.get(url, { timeout: 15_000 });
            // Basic extraction: strip HTML tags, keep text content
            articleText = response.data
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        } catch (err) {
            return res
                .status(400)
                .json({ error: "Failed to fetch content from the provided URL" });
        }

        if (!articleText || articleText.length < 50) {
            return res
                .status(400)
                .json({ error: "Could not extract sufficient text from URL" });
        }

        // Call FastAPI AI service
        const { label, confidence } = await callAiService(articleText);

        // Persist prediction
        const prediction = await Prediction.create({
            userId: req.user.userId,
            text: articleText.substring(0, 5000), // cap stored text at 5 000 chars
            url,
            label,
            confidence,
        });

        res.status(201).json({
            id: prediction._id,
            label,
            confidence,
            url,
            textPreview: articleText.substring(0, 200) + "...",
            createdAt: prediction.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/predictions/history ───────────────────────────
exports.getHistory = async (req, res, next) => {
    try {
        const { label, startDate, endDate, bookmarked, page = 1, limit = 20 } = req.query;

        // Build filter
        const filter = { userId: req.user.userId };

        if (label && ["fake", "real"].includes(label)) {
            filter.label = label;
        }

        if (bookmarked === "true") {
            filter.isBookmarked = true;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [predictions, total] = await Promise.all([
            Prediction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10))
                .lean(),
            Prediction.countDocuments(filter),
        ]);

        res.json({
            predictions,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                pages: Math.ceil(total / parseInt(limit, 10)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// ── PATCH /api/predictions/:id/bookmark ────────────────────
exports.toggleBookmark = async (req, res, next) => {
    try {
        const prediction = await Prediction.findOne({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!prediction) {
            return res.status(404).json({ error: "Prediction not found" });
        }

        prediction.isBookmarked = !prediction.isBookmarked;
        await prediction.save();

        res.json({
            id: prediction._id,
            isBookmarked: prediction.isBookmarked,
        });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/predictions/:id/feedback ─────────────────────
exports.submitFeedback = async (req, res, next) => {
    try {
        const { feedback } = req.body;

        if (!feedback || !["agree", "disagree"].includes(feedback)) {
            return res
                .status(400)
                .json({ error: 'Feedback must be "agree" or "disagree"' });
        }

        const prediction = await Prediction.findOne({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!prediction) {
            return res.status(404).json({ error: "Prediction not found" });
        }

        prediction.feedback = feedback;
        await prediction.save();

        res.json({
            id: prediction._id,
            feedback: prediction.feedback,
        });
    } catch (error) {
        next(error);
    }
};
