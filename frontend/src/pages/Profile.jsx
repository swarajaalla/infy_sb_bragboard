import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  getUserStats,
  getAllUsers,
  getMyShoutouts,
  getReceivedShoutouts,
  getSentShoutouts
} from "../services/api";
import { getDepartmentRank } from "../services/api";


function Profile() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [rank, setRank] = useState(null);
  const [totalDeptUsers, setTotalDeptUsers] = useState(0);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("received"); // received | sent
  const [timeline, setTimeline] = useState([]);


  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadProfileData = async () => {
      // 1. Current user
      const userRes = await getCurrentUser(token);
      setUser(userRes.data);

      // 2. User stats
      const statsRes = await getUserStats(token);
      setStats(statsRes.data);

      // 3. Department rank (backend-calculated)
      const rankRes = await getDepartmentRank(token);
      setRank(rankRes.data.rank);
      setTotalDeptUsers(rankRes.data.total_users);

      // 4. Fetch my shoutouts (timeline)
      const activityRes = await getMyShoutouts(token);
      activityRes.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setActivities(activityRes.data);

    };

    loadProfileData();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const loadTimeline = async () => {
      try {
        const res =
          activeTab === "received"
            ? await getReceivedShoutouts(token)
            : await getMyShoutouts(token);

        const sorted = res.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setActivities(sorted);
      } catch (err) {
        console.error("Timeline error", err);
      }
    };

    loadTimeline();
  }, [activeTab, token]);



  if (!user || !stats) return <p>Loading profile...</p>;

  // Achievements based on existing stats
const badges = [];

if (stats.sent >= 1) badges.push("🎉 First Shoutout");
if (stats.sent >= 5) badges.push("🔥 Active Contributor");
if (stats.received >= 5) badges.push("❤️ Appreciated");
if (stats.reactions >= 10) badges.push("⚡ Reaction Magnet");

  return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">

    <button
      onClick={() => navigate("/dashboard")}
      className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    >
      ← Back to Dashboard
    </button>


    {/* Page Title */}
    <h2 className="text-4xl font-bold mb-10 text-indigo-700">
      My Profile
    </h2>

    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-4xl font-bold">
          {user.name[0]}
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800">
            {user.name}
          </h3>
          <p className="text-gray-500 text-lg">
            {user.department}
          </p>
          <p className="text-gray-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-sm text-gray-500">Shoutouts Sent</p>
          <p className="text-3xl font-bold text-indigo-600">{stats?.sent ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-sm text-gray-500">Shoutouts Received</p>
          <p className="text-3xl font-bold text-green-600">{stats?.received ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-sm text-gray-500">Reactions Given</p>
          <p className="text-3xl font-bold text-yellow-500">{stats?.reactions ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-sm text-gray-500">Department Rank</p>
          <p className="text-3xl font-bold text-purple-600">
            {rank ? `${rank} / ${totalDeptUsers}` : "—"}
          </p>
        </div>


      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4 text-indigo-700">
          Achievements
        </h4>

        {badges.length === 0 ? (
          <p className="text-gray-500">No achievements yet</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

    
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setActiveTab("received")}
        className={`px-4 py-2 rounded ${
          activeTab === "received"
            ? "bg-green-600 text-white"
            : "bg-gray-200"
        }`}
      >
        Received
      </button>

      <button
        onClick={() => setActiveTab("sent")}
        className={`px-4 py-2 rounded ${
          activeTab === "sent"
            ? "bg-blue-600 text-white"
            : "bg-gray-200"
        }`}
      >
        Sent
      </button>
    </div>


    {/* Recent Activity Timeline */}
  <div className="mt-10 bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-semibold mb-6 text-blue-600">
      Recent Activity
    </h2>

    <div className="relative border-l-2 border-gray-300 pl-6 space-y-6">
      {activities.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        activities.map((item) => (
          <div key={item.id} className="relative">
            {/* Timeline dot */}
            <span className="absolute -left-[9px] top-2 w-4 h-4 bg-indigo-500 rounded-full"></span>

            {/* Activity card */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <p className="font-medium text-gray-800">
                {item.message}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {activeTab === "sent" ? (
                  <>
                    👤 You → <b>{item.to_user?.name}</b>
                  </>
                ) : (
                  <>
                    👤 <b>{item.from_user?.name}</b> → You
                  </>
                )}
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>

    <hr className="border-gray-200" />

      {/* Details */}
      <button
        disabled
        className="ml-auto px-4 py-2 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
      >
        Edit Profile
      </button>


      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h4 className="text-xl font-semibold mb-6 text-gray-800">
          Account Details
        </h4>

        <div className="space-y-4">
          <div className="grid grid-cols-2">
            <span className="font-medium text-gray-600">Name</span>
            <span className="text-gray-800">{user.name}</span>
          </div>

          <div className="grid grid-cols-2">
            <span className="font-medium text-gray-600">Email</span>
            <span className="text-gray-800">{user.email}</span>
          </div>

          <div className="grid grid-cols-2">
            <span className="font-medium text-gray-600">Department</span>
            <span className="text-gray-800">{user.department}</span>
          </div>

          <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-600">
            Employee
          </span>

        </div>
      </div>

    </div>
  </div>
);

}

export default Profile;
