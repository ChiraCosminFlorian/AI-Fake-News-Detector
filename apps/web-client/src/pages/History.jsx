// pages/History.jsx
// Purpose: Paginated list of past predictions with label and date filtering

import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ResultCard from "../components/ResultCard";
import { Search, Filter, Loader2 } from "lucide-react";

export default function History() {
    const [predictions, setPredictions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [label, setLabel] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [bookmarked, setBookmarked] = useState(false);

    const fetchHistory = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const params = { page, limit: 10 };
                if (label) params.label = label;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (bookmarked) params.bookmarked = "true";

                const { data } = await api.get("/predictions/history", { params });
                setPredictions(data.predictions);
                setPagination(data.pagination);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        },
        [label, startDate, endDate, bookmarked]
    );

    useEffect(() => {
        fetchHistory(1);
    }, [fetchHistory]);

    const handleBookmark = async (id) => {
        try {
            const { data } = await api.patch(`/predictions/${id}/bookmark`);
            setPredictions((prev) =>
                prev.map((p) =>
                    (p._id || p.id) === id ? { ...p, isBookmarked: data.isBookmarked } : p
                )
            );
        } catch {
            // ignore
        }
    };

    const handleFeedback = async (id, feedback) => {
        try {
            await api.post(`/predictions/${id}/feedback`, { feedback });
            setPredictions((prev) =>
                prev.map((p) =>
                    (p._id || p.id) === id ? { ...p, feedback } : p
                )
            );
        } catch {
            // ignore
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Prediction History</h1>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-600">
                        <Filter className="h-4 w-4" />
                        Filters
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                        <select
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All labels</option>
                            <option value="fake">Fake</option>
                            <option value="real">Real</option>
                        </select>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-field"
                            placeholder="From"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input-field"
                            placeholder="To"
                        />

                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={bookmarked}
                                onChange={(e) => setBookmarked(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            Bookmarked only
                        </label>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                    </div>
                ) : predictions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Search className="mb-3 h-10 w-10" />
                        <p className="text-sm">No predictions found.</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-gray-500">
                            {pagination.total} result{pagination.total !== 1 && "s"} found
                        </p>

                        <div className="space-y-4">
                            {predictions.map((p) => (
                                <ResultCard
                                    key={p._id}
                                    prediction={p}
                                    onBookmark={handleBookmark}
                                    onFeedback={handleFeedback}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                                    (pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchHistory(pageNum)}
                                            className={`h-9 w-9 rounded-lg text-sm font-medium transition ${pageNum === pagination.page
                                                    ? "bg-brand-600 text-white"
                                                    : "text-gray-500 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
