// pages/Dashboard.jsx — Admin main page with stats, ratio chart, and keywords chart

import { useEffect, useState } from "react";
import { getGlobalStats, getFakeRealRatio, getTopKeywords, exportCsv } from "../services/adminService";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { Users, BarChart3, ShieldAlert, ShieldCheck, Activity, Download, Loader2 } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar,
} from "recharts";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [ratio, setRatio] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        Promise.all([getGlobalStats(), getFakeRealRatio(), getTopKeywords()])
            .then(([s, r, k]) => { setStats(s); setRatio(r); setKeywords(k.slice(0, 15)); })
            .finally(() => setLoading(false));
    }, []);

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await exportCsv({});
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "analytics-export.csv";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch { /* ignore */ }
        setExporting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-sm text-gray-500">Platform overview and analytics</p>
                    </div>
                    <button onClick={handleExport} disabled={exporting} className="btn-primary">
                        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Export CSV
                    </button>
                </div>

                {/* Stats grid */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Total Users" value={stats?.totalUsers} icon={Users} color="blue" />
                    <StatsCard title="Total Predictions" value={stats?.totalPredictions} icon={BarChart3} color="brand" />
                    <StatsCard title="Fake Detected" value={stats?.fakeCount} icon={ShieldAlert} color="red"
                        subtitle={`Ratio: ${stats?.fakeRealRatio}`} />
                    <StatsCard title="Real Verified" value={stats?.realCount} icon={ShieldCheck} color="green"
                        subtitle={`Today: ${stats?.predictionsToday}`} />
                </div>

                {/* Charts row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Fake vs Real line chart */}
                    <div className="card">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                            Fake vs Real — Last 30 Days
                        </h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={ratio}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }}
                                    tickFormatter={(d) => d.slice(5)} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                                    labelStyle={{ color: "#9ca3af" }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line type="monotone" dataKey="fake" stroke="#ef4444" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="real" stroke="#22c55e" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top keywords bar chart */}
                    <div className="card">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                            Top Keywords in Fake News
                        </h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={keywords} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <YAxis dataKey="word" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                                />
                                <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}
