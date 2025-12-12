// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [peersData, setPeersData] = useState(null);
  const [loadingPeers, setLoadingPeers] = useState(true);

  useEffect(() => {
    axiosClient.get("/api/users/me")
      .then((res) => {
        setUser(res.data);
        // after we have user, fetch dept peers
        return axiosClient.get("/api/users/department-peers");
      })
      .then((res) => {
        setPeersData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user or peers", err);
      })
      .finally(() => setLoadingPeers(false));
  }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar data={peersData || {}} isAdmin={user.role === "admin"} />

        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            <div className="bg-white p-6 rounded-xl shadow">
              <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
              <p className="text-gray-600 mt-2">{user.email} • <span className="font-medium">{user.department}</span> • {user.role}</p>
            </div>

            <div className="mt-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold">Department peers</h2>
                <p className="text-sm text-gray-500 mt-2">Select a department on the left to view its members.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
