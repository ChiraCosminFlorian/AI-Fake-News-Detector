// components/UsersTable.jsx — Paginated, searchable users data table

import { UserCheck, UserX } from "lucide-react";

export default function UsersTable({ users, pagination, onPageChange, onToggleStatus, search, onSearchChange }) {
    return (
        <div className="card overflow-hidden p-0">
            {/* Search bar */}
            <div className="border-b border-gray-800 p-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by name or email..."
                    className="input-field max-w-sm"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3 text-center">Predictions</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {users.map((u) => (
                            <tr key={u._id} className="transition hover:bg-gray-800/40">
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-200">{u.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-400">{u.email}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "admin" ? "bg-brand-500/10 text-brand-400" : "bg-gray-700 text-gray-300"
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center text-gray-400">
                                    {u.predictionCount ?? 0}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                        }`}>
                                        {u.isActive ? "Active" : "Disabled"}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <button
                                        onClick={() => onToggleStatus(u._id)}
                                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${u.isActive
                                                ? "text-red-400 hover:bg-red-500/10"
                                                : "text-green-400 hover:bg-green-500/10"
                                            }`}
                                    >
                                        {u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                        {u.isActive ? "Disable" : "Enable"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-800 px-6 py-3">
                    <p className="text-xs text-gray-500">{pagination.total} total users</p>
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
