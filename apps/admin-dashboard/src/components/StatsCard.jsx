// components/StatsCard.jsx — Metric card for the admin dashboard

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "brand" }) {
    const colorMap = {
        brand: "bg-brand-500/10 text-brand-400",
        red: "bg-red-500/10 text-red-400",
        green: "bg-green-500/10 text-green-400",
        amber: "bg-amber-500/10 text-amber-400",
        blue: "bg-blue-500/10 text-blue-400",
    };

    return (
        <div className="card flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="mt-0.5 text-2xl font-bold text-white">{value}</p>
                {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );
}
