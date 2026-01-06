import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axiosClient.get("/api/users/me");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return <div className="p-8">Checking access...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
