import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [mostTagged, setMostTagged] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [reports, setReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // User Management States
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "employee"
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (activeTab === "overview") {
      fetchMetrics();
    } else if (activeTab === "contributors") {
      fetchTopContributors();
    } else if (activeTab === "tagged") {
      fetchMostTagged();
    } else if (activeTab === "leaderboard") {
      fetchLeaderboard();
    } else if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "users") {
      fetchAllUsers();
    } else if (activeTab === "logs") {
      fetchAdminLogs();
    } else if (activeTab === "department") {
      fetchDepartmentStats();
    }
  }, [activeTab]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/analytics/metrics");
      setMetrics(response.data);
    } catch (err) {
      setError("Failed to load metrics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopContributors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/analytics/top-contributors?limit=15");
      setTopContributors(response.data);
    } catch (err) {
      setError("Failed to load top contributors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMostTagged = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/analytics/most-tagged?limit=15");
      setMostTagged(response.data);
    } catch (err) {
      setError("Failed to load most tagged users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/leaderboard?limit=20");
      setLeaderboard(response.data);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/reports?limit=50");
      setReports(response.data);
    } catch (err) {
      setError("Failed to load reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users?limit=100");
      setAllUsers(response.data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/logs?limit=50");
      setAdminLogs(response.data);
    } catch (err) {
      setError("Failed to load admin logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/analytics/department-stats");
      setDepartmentStats(response.data);
    } catch (err) {
      setError("Failed to load department stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await api.delete(`/admin/reports/${reportId}`);
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err) {
      alert("Failed to resolve report");
      console.error(err);
    }
  };

  const handleDeleteShoutout = async (shoutoutId) => {
    if (window.confirm("Are you sure you want to delete this shout-out?")) {
      try {
        await api.post(`/admin/${shoutoutId}/delete`);
        alert("Shout-out deleted successfully");
        fetchReports();
      } catch (err) {
        alert("Failed to delete shout-out");
        console.error(err);
      }
    }
  };

  const handleToggleUserRole = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-role`);
      fetchAllUsers();
    } catch (err) {
      alert("Failed to toggle user role");
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.department) {
      setCreateUserError("All fields are required");
      return;
    }
    
    if (newUserData.password.length < 6) {
      setCreateUserError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setCreateUserLoading(true);
      setCreateUserError("");
      
      const response = await api.post("/admin/users/create", newUserData);
      
      alert(`User created successfully! ID: ${response.data.id}`);
      
      // Reset form
      setNewUserData({
        name: "",
        email: "",
        password: "",
        department: "",
        role: "employee"
      });
      setShowCreateUserForm(false);
      
      // Refresh users list
      fetchAllUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to create user";
      setCreateUserError(errorMsg);
      console.error(err);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        alert("User deleted successfully");
        fetchAllUsers();
      } catch (err) {
        const errorMsg = err.response?.data?.detail || "Failed to delete user";
        alert(errorMsg);
        console.error(err);
      }
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get("/admin/export/csv", {
        responseType: "blob"
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bragboard_data_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert("CSV file downloaded successfully!");
    } catch (err) {
      alert("Failed to download CSV file");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your BragBoard platform and view analytics</p>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              📥 Download CSV
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="flex flex-wrap border-b">
            {[
              { id: "overview", label: "📊 Overview", icon: "📊" },
              { id: "contributors", label: "⭐ Top Contributors", icon: "⭐" },
              { id: "tagged", label: "🏷️ Most Tagged", icon: "🏷️" },
              { id: "leaderboard", label: "🏆 Leaderboard", icon: "🏆" },
              { id: "reports", label: "🚩 Reports", icon: "🚩" },
              { id: "users", label: "👥 Users", icon: "👥" },
              { id: "logs", label: "📝 Logs", icon: "📝" },
              { id: "department", label: "🏢 Departments", icon: "🏢" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Shout-Outs</h3>
                  <p className="text-3xl font-bold text-blue-600">{metrics.total_shoutouts}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Comments</h3>
                  <p className="text-3xl font-bold text-green-600">{metrics.total_comments}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Reactions</h3>
                  <p className="text-3xl font-bold text-purple-600">{metrics.total_reactions}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Unique Contributors</h3>
                  <p className="text-3xl font-bold text-orange-600">{metrics.unique_contributors}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Avg Reactions/Post</h3>
                  <p className="text-3xl font-bold text-pink-600">{metrics.average_reactions_per_post.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Avg Comments/Post</h3>
                  <p className="text-3xl font-bold text-indigo-600">{metrics.average_comments_per_post.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Top Contributors Tab */}
            {activeTab === "contributors" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Sent</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Received</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topContributors.map((contributor, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{contributor.user_name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{contributor.department}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">{contributor.sent_count}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">{contributor.received_count}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">{contributor.comment_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Most Tagged Tab */}
            {activeTab === "tagged" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Times Tagged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mostTagged.map((user, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{user.department}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">{user.tagged_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === "leaderboard" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Score</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Sent</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Received</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Reactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leaderboard.map((user, idx) => (
                      <tr key={idx} className={idx < 3 ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"}>
                        <td className="px-6 py-3 text-sm font-bold text-gray-900">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{user.department}</td>
                        <td className="px-6 py-3 text-sm text-right font-bold text-blue-600">{user.score}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-600">{user.sent_shoutouts}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-600">{user.received_shoutouts}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-600">{user.reactions_given}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {reports.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">No reports</div>
                ) : (
                  <div className="space-y-4 p-6">
                    {reports.map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                        {/* Report Header */}
                        <div className="flex justify-between items-start mb-3 pb-3 border-b">
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Report #{report.id}</p>
                            <p className="text-xs text-gray-500">Reported on {new Date(report.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-600">Reported By: <span className="font-bold">{report.reported_by}</span></p>
                            <p className="text-xs text-gray-500">Shout-Out ID: {report.shoutout_id}</p>
                          </div>
                        </div>

                        {/* Report Reason */}
                        <div className="mb-3 p-3 bg-red-50 rounded">
                          <p className="text-xs font-semibold text-red-600 mb-1">Reason:</p>
                          <p className="text-sm text-gray-700">{report.reason}</p>
                        </div>

                        {/* Reported Shout-Out Content */}
                        <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Reported Shout-Out:</p>
                          <div className="bg-white p-3 rounded border border-gray-300">
                            <p className="text-sm text-gray-800">
                              {report.shoutout?.message || <span className="text-gray-400 italic">Shout-out content not available</span>}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteShoutout(report.shoutout_id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Delete Post
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Create User Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                    <button
                      onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {showCreateUserForm ? "Cancel" : "+ Create New User"}
                    </button>
                  </div>
                  
                  {/* Create User Form */}
                  {showCreateUserForm && (
                    <form onSubmit={handleCreateUser} className="border-t pt-4">
                      {createUserError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                          {createUserError}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                          <input
                            type="password"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Min 6 characters"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                          <input
                            type="text"
                            value={newUserData.department}
                            onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Engineering, Sales"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                          <select
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          >
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={createUserLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {createUserLoading ? "Creating..." : "Create User"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                      <thead className="bg-gray-50 border-b sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-32">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-40">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-28">Department</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-24">Role</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-28">Joined</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-56">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {allUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(user.joined_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-2 justify-center flex-wrap">
                                <button
                                  onClick={() => handleToggleUserRole(user.id)}
                                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 whitespace-nowrap"
                                  title="Toggle user role"
                                >
                                  Toggle Role
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 whitespace-nowrap"
                                  title="Delete user"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Logs Tab */}
            {activeTab === "logs" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Admin ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Target</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {adminLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">{log.admin_id}</td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{log.action}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{log.target_id}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{log.target_type}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Department Stats Tab */}
            {activeTab === "department" && (
              <div className="grid grid-cols-1 gap-6">
                {departmentStats.map((dept) => (
                  <div key={dept.department} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{dept.department}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Users</p>
                        <p className="text-2xl font-bold text-blue-600">{dept.user_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Sent</p>
                        <p className="text-2xl font-bold text-green-600">{dept.shoutouts_sent}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Received</p>
                        <p className="text-2xl font-bold text-orange-600">{dept.shoutouts_received}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Comments</p>
                        <p className="text-2xl font-bold text-purple-600">{dept.total_comments}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Reactions</p>
                        <p className="text-2xl font-bold text-pink-600">{dept.total_reactions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
