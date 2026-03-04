// pages/NotFound.jsx
// Purpose: 404 page

import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <h1 className="text-8xl font-extrabold text-brand-600">404</h1>
            <p className="mt-4 text-xl font-semibold text-gray-900">Page not found</p>
            <p className="mt-2 text-sm text-gray-500">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="btn-primary mt-8">
                <Home className="h-4 w-4" />
                Back to Dashboard
            </Link>
        </div>
    );
}
