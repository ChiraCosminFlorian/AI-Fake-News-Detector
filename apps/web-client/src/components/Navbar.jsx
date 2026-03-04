// components/Navbar.jsx
// Purpose: Top navigation bar with logo, links, and logout button

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { LogOut, Shield, History, Home } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-600">
                    <Shield className="h-6 w-6" />
                    FakeScope
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-1">
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Home className="h-4 w-4" />
                        Dashboard
                    </Link>

                    <Link
                        to="/history"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <History className="h-4 w-4" />
                        History
                    </Link>

                    {/* User info + logout */}
                    <div className="ml-2 flex items-center gap-3 border-l border-gray-200 pl-4">
                        <span className="text-sm text-gray-500">
                            {user?.name}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
