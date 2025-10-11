// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getUser();
        setSession(user);
      } catch (error) {
        console.error("Error checking auth:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-700 text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p className="mt-6 text-lg font-medium">Checking session...</p>
      </div>
    );

  if (!session) return <Navigate to="/" replace />;

  return children;
}
