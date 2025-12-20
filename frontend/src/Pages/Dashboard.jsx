import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Navbar user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="ml-6">
              <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-indigo-600 text-lg font-semibold">{user.department}</p>
            </div>
          </div>
          <p className="text-gray-600">
            Welcome to BragBoard! Start sharing your professional achievements and celebrate your team's wins.
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition transform hover:scale-105">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Your Achievements</h3>
            <p className="text-gray-600">Share and track your professional wins</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition transform hover:scale-105">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Celebrate your team's accomplishments</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition transform hover:scale-105">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analytics</h3>
            <p className="text-gray-600">Track your growth and impact</p>
          </div>
        </div>

        {/* User Details */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Email</p>
              <p className="text-gray-800 text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Department</p>
              <p className="text-gray-800 text-lg">{user.department}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Role</p>
              <p className="text-gray-800 text-lg capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">User ID</p>
              <p className="text-gray-800 text-lg">#{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
