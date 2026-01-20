import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CreateShoutOut from "../components/CreateShoutOut";
import ShoutOutFeed from "../components/ShoutOutFeed";
import { useNavigate } from "react-router-dom";

// Profile View Component
function ProfileView({ userId, onBack, users }) {
  const { user: currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [allShoutouts, setAllShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [profileTab, setProfileTab] = useState("all"); // "all", "sent", "received"
  const [stats, setStats] = useState({
    sent_count: 0,
    received_count: 0,
    reaction_count: 0,
  });

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Find user from the users list passed in
      const user = users.find(u => u.id === parseInt(userId));
      if (!user) throw new Error("User not found");
      setProfile(user);

      // Fetch all shoutouts related to this user (both sent and received)
      const sentResponse = await api.get(`/shoutouts?sender_id=${userId}&limit=50`);
      const receivedResponse = await api.get(`/shoutouts?recipient_id=${userId}&limit=50`);
      
      const sent = sentResponse.data || [];
      const received = receivedResponse.data || [];
      
      // Mark each shoutout to indicate if it's sent or received
      const sentWithType = sent.map(s => ({ ...s, type: "sent" }));
      const receivedWithType = received.map(r => ({ ...r, type: "received" }));
      
      // Combine and sort by date
      const combined = [...sentWithType, ...receivedWithType].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setAllShoutouts(combined);

      // Calculate stats
      const reactionCount = combined.reduce(
        (sum, shout) => sum + (shout.reactions?.length || 0),
        0
      ) || 0;

      setStats({
        sent_count: sent.length,
        received_count: received.length,
        reaction_count: reactionCount,
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
  };

  const getReactionCount = (shoutout, type) => {
    return shoutout.reactions?.filter(r => r.type === type).length || 0;
  };

  const getUserReaction = (shoutout, type) => {
    return shoutout.reactions?.some(r => r.type === type && r.user?.id === currentUser?.id);
  };

  const handleAddReaction = async (shoutoutId, type) => {
    if (!currentUser) {
      alert("Please log in to react");
      return;
    }

    try {
      const shoutout = allShoutouts.find(s => s.id === shoutoutId);
      const isReacted = getUserReaction(shoutout, type);
      
      if (isReacted) {
        await api.delete(`/shoutouts/${shoutoutId}/reactions/${type}`);
      } else {
        await api.post(`/shoutouts/${shoutoutId}/reactions`, { type });
      }

      // Refetch the single shoutout
      const response = await api.get(`/shoutouts/${shoutoutId}`);
      setAllShoutouts(allShoutouts.map(s => s.id === shoutoutId ? { ...response.data, type: s.type } : s));
    } catch (err) {
      console.error("Error handling reaction:", err);
      alert(err.response?.data?.detail || "Failed to process reaction");
    }
  };

  const toggleComments = (shoutoutId) => {
    setExpandedComments(prev => ({
      ...prev,
      [shoutoutId]: !prev[shoutoutId]
    }));
  };

  const handleAddComment = async (shoutoutId) => {
    if (!currentUser) {
      alert("Please log in to comment");
      return;
    }

    const content = commentInput[shoutoutId];
    if (!content || !content.trim()) return;

    try {
      await api.post(`/shoutouts/${shoutoutId}/comments`, { content });
      setCommentInput(prev => ({ ...prev, [shoutoutId]: "" }));

      // Refetch the shoutout
      const response = await api.get(`/shoutouts/${shoutoutId}`);
      const originalShoutout = allShoutouts.find(s => s.id === shoutoutId);
      setAllShoutouts(allShoutouts.map(s => s.id === shoutoutId ? { ...response.data, type: originalShoutout.type } : s));
    } catch (err) {
      console.error("Error adding comment:", err);
      alert(err.response?.data?.detail || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (shoutoutId, commentId) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await api.delete(`/shoutouts/${shoutoutId}/comments/${commentId}`);

      // Refetch the shoutout
      const response = await api.get(`/shoutouts/${shoutoutId}`);
      const originalShoutout = allShoutouts.find(s => s.id === shoutoutId);
      setAllShoutouts(allShoutouts.map(s => s.id === shoutoutId ? { ...response.data, type: originalShoutout.type } : s));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.response?.data?.detail || "Failed to delete comment");
    }
  };

  // Filter shoutouts based on active tab
  const filteredShoutouts = allShoutouts.filter(shout => {
    if (profileTab === "sent") return shout.type === "sent";
    if (profileTab === "received") return shout.type === "received";
    return true; // "all"
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-lg">User not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
      >
        ← Back
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {profile.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="ml-6">
            <h1 className="text-4xl font-bold text-gray-800">{profile.name}</h1>
            <p className="text-indigo-600 text-lg font-semibold">{profile.department}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.sent_count}</div>
          <p className="text-gray-600 text-sm mt-2">Shout-Outs Sent</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.received_count}</div>
          <p className="text-gray-600 text-sm mt-2">Received</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-3xl font-bold text-pink-600">{stats.reaction_count}</div>
          <p className="text-gray-600 text-sm mt-2">Reactions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setProfileTab("all")}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              profileTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setProfileTab("sent")}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              profileTab === "sent"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sent ({stats.sent_count})
          </button>
          <button
            onClick={() => setProfileTab("received")}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              profileTab === "received"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Received ({stats.received_count})
          </button>
        </div>
      </div>

      {/* Shout-Outs Feed */}
      <div className="space-y-4">
        {filteredShoutouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              {profileTab === "sent" && "No shout-outs sent yet"}
              {profileTab === "received" && "No shout-outs received yet"}
              {profileTab === "all" && "No shout-outs yet"}
            </p>
          </div>
        ) : (
          filteredShoutouts.map((shoutout) => (
            <div key={shoutout.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border-l-4" style={{
              borderColor: shoutout.type === "sent" ? "#3b82f6" : "#a855f7"
            }}>
              {/* Post Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {getInitials(shoutout.sender?.name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {shoutout.sender?.name || "Unknown"}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          shoutout.type === "sent" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {shoutout.type === "sent" ? "📤 Sent" : "📥 Received"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {shoutout.sender?.department || "Unknown Department"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(shoutout.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                {shoutout.message && (
                  <p className="text-gray-800 text-base leading-relaxed mb-4">
                    {shoutout.message}
                  </p>
                )}

                {/* Recipients Tags */}
                {shoutout.recipients && shoutout.recipients.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Shout-out to:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {shoutout.recipients.map((recipientObj) => (
                        <span
                          key={recipientObj.id}
                          className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          @{recipientObj.recipient?.name || "Unknown"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Post Stats */}
              <div className="px-4 py-2 border-t border-gray-100 flex justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span>{getReactionCount(shoutout, "heart")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>👍</span>
                    <span>{getReactionCount(shoutout, "thumbs_up")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>👏</span>
                    <span>{getReactionCount(shoutout, "clap")}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span>💬</span>
                  <span>{shoutout.comments?.length || 0}</span>
                </div>
              </div>

              {/* Reaction Buttons */}
              <div className="px-4 py-2 border-t border-gray-100 flex justify-between">
                <button
                  onClick={() => handleAddReaction(shoutout.id, "heart")}
                  className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 rounded-lg transition ${
                    getUserReaction(shoutout, "heart")
                      ? "text-red-500 bg-red-50"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <span>❤️</span>
                  <span>Heart</span>
                </button>

                <button
                  onClick={() => handleAddReaction(shoutout.id, "thumbs_up")}
                  className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 rounded-lg transition ${
                    getUserReaction(shoutout, "thumbs_up")
                      ? "text-blue-500 bg-blue-50"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <span>👍</span>
                  <span>Thumbs Up</span>
                </button>

                <button
                  onClick={() => handleAddReaction(shoutout.id, "clap")}
                  className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 rounded-lg transition ${
                    getUserReaction(shoutout, "clap")
                      ? "text-yellow-500 bg-yellow-50"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <span>👏</span>
                  <span>Clap</span>
                </button>

                <button
                  onClick={() => toggleComments(shoutout.id)}
                  className="flex-1 py-2 px-4 flex items-center justify-center space-x-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                >
                  <span>💬</span>
                  <span>Comment</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[shoutout.id] && (
                <div className="border-t border-gray-100">
                  {/* Comments List */}
                  <div className="px-4 py-2 max-h-64 overflow-y-auto">
                    {shoutout.comments && shoutout.comments.length > 0 ? (
                      <div className="space-y-3">
                        {shoutout.comments.map((comment) => (
                          <div key={comment.id} className="flex space-x-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                {getInitials(comment.user?.name)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <p className="font-semibold text-sm text-gray-900">
                                  {comment.user?.name}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {comment.content}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                <span>{formatDate(comment.created_at)}</span>
                                {currentUser?.id === comment.user?.id && (
                                  <button
                                    onClick={() => handleDeleteComment(shoutout.id, comment.id)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm py-4 text-center">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  {currentUser && (
                    <div className="px-4 py-3 border-t border-gray-100 flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInput[shoutout.id] || ""}
                        onChange={(e) =>
                          setCommentInput(prev => ({
                            ...prev,
                            [shoutout.id]: e.target.value
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(shoutout.id);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(shoutout.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user: contextUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(contextUser || null);
  const [loading, setLoading] = useState(!contextUser);
  const [activeTab, setActiveTab] = useState("feed");
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" or "profile"
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedDept, setExpandedDept] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile

  useEffect(() => {
    // If we have context user, use it
    if (contextUser) {
      setUser(contextUser);
      setLoading(false);
      fetchUsers();
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
        fetchUsers();
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [contextUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/shoutouts/departments/all");
      const deptList = response.data;
      setDepartments(deptList);
      
      // Fetch all users using the public endpoint
      const usersResponse = await api.get("/shoutouts/users/all");
      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const getUsersByDepartment = (dept) => {
    return users.filter(u => u.department === dept);
  };

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

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Hamburger Menu Button - Mobile Only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition"
          title="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Left Sidebar - Toggleable */}
        <div
          className={`fixed md:static top-20 left-0 h-[calc(100vh-80px)] w-80 bg-white shadow-lg overflow-y-auto border-r border-gray-200 transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Sidebar Navigation */}
          <div className="p-4 border-b border-gray-200 space-y-2">
            <button
              onClick={() => {
                setActiveTab("feed");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === "feed"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              📢 View Feed
            </button>
            <button
              onClick={() => {
                setActiveTab("post");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === "post"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ✍️ Post Shout-Out
            </button>
            <button
              onClick={() => {
                navigate("/profile");
                setSidebarOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              👤 My Profile
            </button>
          </div>

          {/* Departments List */}
          <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">🏢 Departments</h3>
            <div className="space-y-2">
              {departments.map((dept) => {
                const deptUsers = getUsersByDepartment(dept);
                const isExpanded = expandedDept === dept;
                
                return (
                  <div key={dept}>
                    <button
                      onClick={() => setExpandedDept(isExpanded ? null : dept)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition font-semibold text-gray-700 flex justify-between items-center"
                    >
                      <span>{dept} ({deptUsers.length})</span>
                      <span className="text-sm">{isExpanded ? "▼" : "▶"}</span>
                    </button>
                    
                    {isExpanded && (
                      <div className="pl-2 space-y-1 mt-1">
                        {deptUsers.map((deptUser) => (
                          <button
                            key={deptUser.id}
                            onClick={() => {
                              setActiveView("profile");
                              setSelectedUserId(deptUser.id);
                              setSidebarOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition text-sm text-gray-600 hover:text-blue-600"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {deptUser.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="font-medium truncate">{deptUser.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto w-full md:w-auto bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {activeView === "profile" && selectedUserId ? (
              <ProfileView userId={selectedUserId} onBack={() => setActiveView("dashboard")} users={users} />
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
