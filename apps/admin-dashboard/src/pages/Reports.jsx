// pages/Reports.jsx — User feedback reports page

import { useEffect, useState, useCallback } from "react";
import { getReports } from "../services/adminService";
import Navbar from "../components/Navbar";
import ReportsTable from "../components/ReportsTable";
import { Loader2, Inbox } from "lucide-react";

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const data = await getReports({ page, limit: 15 });
            setReports(data.reports);
            setPagination(data.pagination);
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => { fetchReports(1); }, [fetchReports]);

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">User Reports</h1>
                    <p className="text-sm text-gray-500">Predictions where users submitted feedback</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Inbox className="mb-3 h-10 w-10" />
                        <p className="text-sm">No feedback reports yet.</p>
                    </div>
                ) : (
                    <ReportsTable
                        reports={reports}
                        pagination={pagination}
                        onPageChange={(p) => fetchReports(p)}
                    />
                )}
            </main>
        </div>
    );
}
