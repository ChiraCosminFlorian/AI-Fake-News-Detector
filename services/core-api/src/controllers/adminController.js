// src/controllers/adminController.js
// Purpose: Admin-only endpoints — stats, user management, reports, CSV export

const User = require("../models/User");
const Prediction = require("../models/Prediction");

// ── GET /api/admin/stats ───────────────────────────────────
exports.getGlobalStats = async (_req, res, next) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [totalUsers, totalPredictions, fakeCount, realCount, predictionsToday] =
            await Promise.all([
                User.countDocuments(),
                Prediction.countDocuments(),
                Prediction.countDocuments({ label: "fake" }),
                Prediction.countDocuments({ label: "real" }),
                Prediction.countDocuments({ createdAt: { $gte: todayStart } }),
            ]);

        res.json({
            totalUsers,
            totalPredictions,
            fakeCount,
            realCount,
            fakeRealRatio:
                realCount === 0
                    ? fakeCount > 0
                        ? "all fake"
                        : "0:0"
                    : (fakeCount / realCount).toFixed(2),
            predictionsToday,
        });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/admin/fake-real-ratio ─────────────────────────
exports.getFakeRealRatio = async (_req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const ratioByDate = await Prediction.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        label: "$label",
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.date": 1 } },
        ]);

        // Reshape into { date, fake, real }
        const dateMap = {};
        for (const entry of ratioByDate) {
            const date = entry._id.date;
            if (!dateMap[date]) dateMap[date] = { date, fake: 0, real: 0 };
            dateMap[date][entry._id.label] = entry.count;
        }

        res.json(Object.values(dateMap));
    } catch (error) {
        next(error);
    }
};

// ── GET /api/admin/top-keywords ────────────────────────────
exports.getTopKeywords = async (_req, res, next) => {
    try {
        // Fetch text from the most recent 1 000 fake predictions
        const fakePredictions = await Prediction.find({ label: "fake" })
            .sort({ createdAt: -1 })
            .limit(1000)
            .select("text")
            .lean();

        // Simple word frequency count
        const stopWords = new Set([
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
            "for", "of", "is", "it", "that", "this", "was", "are", "be",
            "has", "have", "had", "with", "as", "by", "from", "not", "he",
            "she", "they", "we", "you", "i", "his", "her", "its", "our",
            "their", "my", "your", "will", "would", "could", "should",
            "been", "being", "do", "does", "did", "can", "may", "about",
            "up", "out", "if", "no", "so", "what", "which", "who", "whom",
            "when", "where", "how", "all", "each", "every", "both", "few",
            "more", "most", "other", "some", "such", "than", "too", "very",
            "just", "also", "into", "over", "after", "before", "between",
            "through", "during", "said", "one", "two", "new", "s", "t",
        ]);

        const freq = {};
        for (const doc of fakePredictions) {
            const words = doc.text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
            for (const word of words) {
                if (word.length > 2 && !stopWords.has(word)) {
                    freq[word] = (freq[word] || 0) + 1;
                }
            }
        }

        // Sort and return top 30
        const topKeywords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([word, count]) => ({ word, count }));

        res.json(topKeywords);
    } catch (error) {
        next(error);
    }
};

// ── GET /api/admin/users ───────────────────────────────────
exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10))
                .lean(),
            User.countDocuments(filter),
        ]);

        // Attach prediction count for each user
        const userIds = users.map((u) => u._id);
        const predictionCounts = await Prediction.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]);
        const countMap = {};
        for (const p of predictionCounts) {
            countMap[p._id.toString()] = p.count;
        }

        const result = users.map((u) => ({
            ...u,
            predictionCount: countMap[u._id.toString()] || 0,
        }));

        res.json({
            users: result,
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

// ── PATCH /api/admin/users/:id/status ──────────────────────
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent admin from disabling themselves
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({ error: "Cannot disable your own account" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
        });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/admin/reports ─────────────────────────────────
exports.getReports = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const filter = { feedback: { $ne: null } };

        const [reports, total] = await Promise.all([
            Prediction.find(filter)
                .populate("userId", "name email")
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10))
                .lean(),
            Prediction.countDocuments(filter),
        ]);

        res.json({
            reports,
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

// ── GET /api/admin/export-csv ──────────────────────────────
exports.exportAnalyticsCsv = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const predictions = await Prediction.find(filter)
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        // Build CSV string
        const header = "ID,User,Email,Label,Confidence,Feedback,Bookmarked,URL,Date\n";
        const rows = predictions.map((p) => {
            const user = p.userId || {};
            return [
                p._id,
                `"${(user.name || "deleted").replace(/"/g, '""')}"`,
                user.email || "n/a",
                p.label,
                p.confidence,
                p.feedback || "",
                p.isBookmarked,
                p.url || "",
                p.createdAt?.toISOString() || "",
            ].join(",");
        });

        const csv = header + rows.join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=analytics-export.csv");
        res.send(csv);
    } catch (error) {
        next(error);
    }
};
