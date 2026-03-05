// components/ReportsTable.jsx — Feedback / reports data table

import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function ReportsTable({ reports, pagination, onPageChange }) {
    return (
        <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Prediction</th>
                            <th className="px-6 py-3 text-center">AI Verdict</th>
                            <th className="px-6 py-3 text-center">Confidence</th>
                            <th className="px-6 py-3 text-center">Feedback</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {reports.map((r) => (
                            <tr key={r._id} className="transition hover:bg-gray-800/40">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-200">{r.userId?.name || "Deleted"}</p>
                                        <p className="text-xs text-gray-500">{r.userId?.email || "—"}</p>
                                    </div>
                                </td>
                                <td className="max-w-xs truncate px-6 py-4 text-gray-400">
                                    {r.text?.substring(0, 80)}...
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.label === "fake" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                                        }`}>
                                        {r.label}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center text-gray-400">
                                    {Math.round(r.confidence * 100)}%
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    {r.feedback === "agree" ? (
                                        <span className="inline-flex items-center gap-1 text-green-400">
                                            <ThumbsUp className="h-3.5 w-3.5" /> Agree
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-red-400">
                                            <ThumbsDown className="h-3.5 w-3.5" /> Disagree
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">
                                    {new Date(r.updatedAt || r.createdAt).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric",
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-800 px-6 py-3">
                    <p className="text-xs text-gray-500">{pagination.total} total reports</p>
                    <div className="flex gap-1">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`h-8 w-8 rounded-md text-xs font-medium transition ${p === pagination.page ? "bg-brand-600 text-white" : "text-gray-400 hover:bg-gray-800"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
