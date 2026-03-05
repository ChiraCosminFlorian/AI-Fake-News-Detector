// pages/NotFound.jsx — 404 page for admin panel

import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <h1 className="text-8xl font-extrabold text-brand-500">404</h1>
            <p className="mt-4 text-xl font-semibold text-white">Page not found</p>
            <p className="mt-2 text-sm text-gray-500">This page doesn't exist in the admin panel.</p>
            <Link to="/" className="btn-primary mt-8">
                <Home className="h-4 w-4" /> Back to Dashboard
            </Link>
        </div>
    );
}
