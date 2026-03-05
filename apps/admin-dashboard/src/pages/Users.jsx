// pages/Users.jsx — User management page

import { useEffect, useState, useCallback } from "react";
import { getUsers, toggleUserStatus } from "../services/adminService";
import Navbar from "../components/Navbar";
import UsersTable from "../components/UsersTable";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const data = await getUsers({ page, limit: 15, search: search || undefined });
            setUsers(data.users);
            setPagination(data.pagination);
        } catch { /* ignore */ }
        setLoading(false);
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(1), 300); // debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleToggle = async (id) => {
        try {
            const updated = await toggleUserStatus(id);
            setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isActive: updated.isActive } : u)));
        } catch { /* ignore */ }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-sm text-gray-500">View, search, and manage user accounts</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                    </div>
                ) : (
                    <UsersTable
                        users={users}
                        pagination={pagination}
                        onPageChange={(p) => fetchUsers(p)}
                        onToggleStatus={handleToggle}
                        search={search}
                        onSearchChange={setSearch}
                    />
                )}
            </main>
        </div>
    );
}
