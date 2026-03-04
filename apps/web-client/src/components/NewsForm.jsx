// components/NewsForm.jsx
// Purpose: Tabbed form for text input and URL input

import { useState } from "react";
import { FileText, Link as LinkIcon, Loader2 } from "lucide-react";

export default function NewsForm({ onSubmit, isLoading }) {
    const [activeTab, setActiveTab] = useState("text");
    const [text, setText] = useState("");
    const [url, setUrl] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === "text") {
            onSubmit({ type: "text", value: text });
        } else {
            onSubmit({ type: "url", value: url });
        }
    };

    const canSubmit =
        !isLoading &&
        ((activeTab === "text" && text.trim().length > 0) ||
            (activeTab === "url" && url.trim().length > 0));

    return (
        <div className="card">
            {/* Tabs */}
            <div className="mb-5 flex gap-1 rounded-lg bg-gray-100 p-1">
                <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${activeTab === "text"
                            ? "bg-white text-brand-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <FileText className="h-4 w-4" />
                    Paste Text
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("url")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${activeTab === "url"
                            ? "bg-white text-brand-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <LinkIcon className="h-4 w-4" />
                    Enter URL
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                {activeTab === "text" ? (
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste the news article text here..."
                        rows={6}
                        className="input-field resize-none"
                    />
                ) : (
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/news-article"
                        className="input-field"
                    />
                )}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="btn-primary mt-4 w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        "Analyze"
                    )}
                </button>
            </form>
        </div>
    );
}
