// pages/VerifyEmail.jsx
// Purpose: Calls the verify-email API on mount, shows success or error

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await api.get(`/auth/verify-email/${token}`);
                setMessage(data.message);
                setStatus("success");
            } catch (err) {
                setMessage(err.response?.data?.error || "Verification failed. The link may be invalid or expired.");
                setStatus("error");
            }
        };
        verify();
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
            <div className="w-full max-w-md text-center">
                <div className="mb-8">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
                        <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
                </div>

                <div className="card">
                    {status === "loading" && (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                            <p className="text-sm text-gray-500">Verifying your email...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <p className="text-sm font-medium text-gray-700">{message}</p>
                            <Link to="/login" className="btn-primary mt-4">
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <XCircle className="h-12 w-12 text-red-500" />
                            <p className="text-sm font-medium text-red-600">{message}</p>
                            <Link to="/register" className="btn-primary mt-4">
                                Try Again
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
