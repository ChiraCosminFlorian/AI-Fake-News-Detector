// components/ResultCard.jsx
// Purpose: Displays the prediction label, confidence, and text preview

import ConfidenceBadge from "./ConfidenceBadge";
import { Bookmark, BookmarkCheck, MessageSquare } from "lucide-react";

export default function ResultCard({ prediction, onBookmark, onFeedback }) {
    const isFake = prediction.label === "fake";

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

            {/* Text preview */}
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
                {prediction.text?.length > 300
                    ? prediction.text.substring(0, 300) + "..."
                    : prediction.text}
            </p>

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
