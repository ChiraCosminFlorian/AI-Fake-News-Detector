// components/ConfidenceBadge.jsx
// Purpose: Colored badge that shows the prediction confidence as a percentage

export default function ConfidenceBadge({ label, confidence }) {
    const percent = Math.round(confidence * 100);
    const isFake = label === "fake";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${isFake
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
        >
            <span
                className={`h-2 w-2 rounded-full ${isFake ? "bg-red-500" : "bg-green-500"}`}
            />
            {isFake ? "Fake" : "Real"} · {percent}%
        </span>
    );
}
