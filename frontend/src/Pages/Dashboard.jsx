import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CreateShoutOut from "../components/CreateShoutOut";
import ShoutOutFeed from "../components/ShoutOutFeed";

export default function Dashboard() {
  const { user: contextUser } = useContext(AuthContext);
  const [user, setUser] = useState(contextUser || null);
  const [loading, setLoading] = useState(!contextUser);
  const [activeTab, setActiveTab] = useState("feed");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // If we have context user, use it
    if (contextUser) {
      setUser(contextUser);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    
    if (!token) {
      // No token, redirect to login
      window.location.href = "/login";
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        console.log("User data:", res.data);
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [contextUser]);

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

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === "feed"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-800 shadow-md hover:shadow-lg"
            }`}
          >
            📢 View Feed
          </button>
          <button
            onClick={() => setActiveTab("post")}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === "post"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-800 shadow-md hover:shadow-lg"
            }`}
          >
            ✍️ Post Shout-Out
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "feed" ? (
          <ShoutOutFeed refreshTrigger={refreshTrigger} />
        ) : (
          <>
            <CreateShoutOut
              onSuccess={() => {
                setActiveTab("feed");
                setRefreshTrigger(refreshTrigger + 1);
              }}
            />
          </>
        )}

        {/* User Details */}
        <div className="mt-12 bg-white rounded-2xl shadow-md p-6">
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
