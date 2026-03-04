// src/models/RefreshToken.js
// Purpose: Mongoose schema for storing refresh tokens (deleted on logout)

const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index — MongoDB auto-deletes once expiresAt is reached
    },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
