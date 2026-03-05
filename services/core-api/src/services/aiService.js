// src/services/aiService.js
// Purpose: HTTP proxy to the FastAPI ai-inference microservice

const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Send text to the FastAPI /predict endpoint and return the result.
 *
 * @param   {string} text  — cleaned article text
 * @returns {{ label: string, confidence: number, highlights: Array }}
 */
async function callAiService(text) {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/predict`,
            { text },
            { timeout: 30_000 } // 30 s — ML inference can be slow
        );

        return {
            label: response.data.label,
            confidence: response.data.confidence,
            highlights: response.data.highlights || [],
        };
    } catch (error) {
        if (error.response) {
            // AI service responded with an error status
            throw new Error(
                `AI service error (${error.response.status}): ${error.response.data?.detail || "Unknown error"
                }`
            );
        }
        // Network / connection error
        throw new Error(
            "AI inference service is unavailable. Please try again later."
        );
    }
}

module.exports = { callAiService };
