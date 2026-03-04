// src/models/Prediction.js
// Purpose: Mongoose schema for user prediction submissions

const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        text: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            default: null,
        },
        label: {
            type: String,
            enum: ["fake", "real"],
            required: true,
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
        },
        isBookmarked: {
            type: Boolean,
            default: false,
        },
        feedback: {
            type: String,
            enum: ["agree", "disagree", null],
            default: null,
        },
    },
    {
        timestamps: true, // createdAt + updatedAt
    }
);

// Compound index for efficient history queries with label filter
predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ userId: 1, label: 1, createdAt: -1 });

module.exports = mongoose.model("Prediction", predictionSchema);
