// pages/Dashboard.jsx
// Purpose: Main page — submit text or URL for prediction and view result

import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import NewsForm from "../components/NewsForm";
import ResultCard from "../components/ResultCard";
import { AlertTriangle } from "lucide-react";

export default function Dashboard() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async ({ type, value }) => {
        setError("");
        setResult(null);
        setLoading(true);

        try {
            let response;
            if (type === "text") {
                response = await api.post("/predictions/analyze-text", { text: value });
            } else {
                response = await api.post("/predictions/analyze-url", { url: value });
            }
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async (id) => {
        try {
            const { data } = await api.patch(`/predictions/${id}/bookmark`);
            setResult((prev) => ({ ...prev, isBookmarked: data.isBookmarked }));
        } catch {
            // ignore
        }
    };

    const handleFeedback = async (id, feedback) => {
        try {
            await api.post(`/predictions/${id}/feedback`, { feedback });
            setResult((prev) => ({ ...prev, feedback }));
        } catch {
            // ignore
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 py-10">
                {/* Hero */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Detect Fake News <span className="text-brand-600">Instantly</span>
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Paste an article or enter a URL and our AI will analyze its credibility.
                    </p>
                </div>

                {/* Input Form */}
                <NewsForm onSubmit={handleSubmit} isLoading={loading} />

                {/* Error */}
                {error && (
                    <div className="mt-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="mt-6">
                        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Analysis Result
                        </h2>
                        <ResultCard
                            prediction={{
                                _id: result.id,
                                text: result.text || result.textPreview || "",
                                url: result.url,
                                label: result.label,
                                confidence: result.confidence,
                                highlights: result.highlights || [],
                                createdAt: result.createdAt,
                                isBookmarked: result.isBookmarked || false,
                                feedback: result.feedback || null,
                            }}
                            onBookmark={handleBookmark}
                            onFeedback={handleFeedback}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
