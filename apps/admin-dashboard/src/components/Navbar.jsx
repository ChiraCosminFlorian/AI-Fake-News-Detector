// components/Navbar.jsx — Admin top navigation

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { LayoutDashboard, Users, FileWarning, LogOut, ShieldCheck } from "lucide-react";

const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/users", label: "Users", icon: Users },
    { to: "/reports", label: "Reports", icon: FileWarning },
];

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-400">
                    <ShieldCheck className="h-6 w-6" />
                    FakeScope <span className="text-xs font-normal text-gray-500">Admin</span>
                </Link>

                {/* Nav links */}
                <div className="flex items-center gap-1">
                    {links.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${pathname === to
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="ml-4 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
