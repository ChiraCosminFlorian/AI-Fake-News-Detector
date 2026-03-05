// components/ResultCard.jsx
// Purpose: Displays the prediction label, confidence, highlighted text, and actions

import { useState } from "react";
import ConfidenceBadge from "./ConfidenceBadge";
import { Bookmark, BookmarkCheck, MessageSquare, Sparkles } from "lucide-react";

/**
 * Highlight words in the text that appear in the highlights array.
 * Highlighted words are coloured and show a SHAP score tooltip on hover.
 */
function HighlightedText({ text, highlights, isFake }) {
    if (!highlights || highlights.length === 0 || !text) {
        return <span>{text?.length > 300 ? text.substring(0, 300) + "..." : text}</span>;
    }

    // Build a Set of lowercase highlighted words for fast lookup
    const highlightMap = {};
    for (const h of highlights) {
        highlightMap[h.word.toLowerCase()] = h.score;
    }

    // Split text into words while keeping whitespace/punctuation attached
    const displayText = text.length > 500 ? text.substring(0, 500) + "..." : text;
    const tokens = displayText.split(/(\s+)/);

    return (
        <>
            {tokens.map((token, i) => {
                const cleanWord = token.toLowerCase().replace(/[^\w]/g, "");
                const score = highlightMap[cleanWord];

                if (score !== undefined && token.trim()) {
                    return (
                        <span key={i} className="group relative inline">
                            <span
                                className={`rounded px-0.5 font-semibold ${isFake
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {token}
                            </span>
                            {/* Tooltip */}
                            <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                SHAP: {score.toFixed(4)}
                            </span>
                        </span>
                    );
                }
                return <span key={i}>{token}</span>;
            })}
        </>
    );
}

export default function ResultCard({ prediction, onBookmark, onFeedback }) {
    const isFake = prediction.label === "fake";
    const hasHighlights = prediction.highlights && prediction.highlights.length > 0;

    return (
        <div
            className={`card relative overflow-hidden border-l-4 ${isFake ? "border-l-red-500" : "border-l-green-500"
                }`}
        >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <ConfidenceBadge label={prediction.label} confidence={prediction.confidence} />
                <span className="text-xs text-gray-400">
                    {new Date(prediction.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>

            {/* Text with highlighting */}
            <div className="mb-4 text-sm leading-relaxed text-gray-700">
                <HighlightedText
                    text={prediction.text}
                    highlights={prediction.highlights}
                    isFake={isFake}
                />
            </div>

            {/* Highlights legend */}
            {hasHighlights && (
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <Sparkles className={`h-3.5 w-3.5 ${isFake ? "text-red-500" : "text-green-500"}`} />
                    <span className="text-xs font-medium text-gray-500">Key words:</span>
                    {prediction.highlights.slice(0, 8).map((h, i) => (
                        <span
                            key={i}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${isFake ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                }`}
                        >
                            {h.word}
                        </span>
                    ))}
                </div>
            )}

            {prediction.url && (
                <a
                    href={prediction.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-4 inline-block text-xs text-brand-600 underline"
                >
                    {prediction.url}
                </a>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                {onBookmark && (
                    <button
                        onClick={() => onBookmark(prediction._id || prediction.id)}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${prediction.isBookmarked
                                ? "bg-yellow-50 text-yellow-600"
                                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            }`}
                    >
                        {prediction.isBookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                        )}
                        {prediction.isBookmarked ? "Bookmarked" : "Bookmark"}
                    </button>
                )}

                {onFeedback && !prediction.feedback && (
                    <div className="ml-auto flex gap-1">
                        <button
                            onClick={() => onFeedback(prediction._id || prediction.id, "agree")}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-green-600 transition hover:bg-green-50"
                        >
                            👍 Agree
                        </button>
                        <button
                            onClick={() => onFeedback(prediction._id || prediction.id, "disagree")}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                            👎 Disagree
                        </button>
                    </div>
                )}

                {prediction.feedback && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Feedback: {prediction.feedback}
                    </span>
                )}
            </div>
        </div>
    );
}
