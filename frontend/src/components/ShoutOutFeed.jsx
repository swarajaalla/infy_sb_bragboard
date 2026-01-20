import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function ShoutOutFeed({ refreshTrigger }) {
  const { user } = useContext(AuthContext);
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentInput, setCommentInput] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState({});
  const [showReportModal, setShowReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  // Filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterSender, setFilterSender] = useState("");
  const [departments, setDepartments] = useState([]);

  const fetchShoutouts = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filterDepartment) {
        params.append("department", filterDepartment);
      }

      if (filterSender) {
        params.append("sender_id", filterSender);
      }

      params.append("limit", 50);

      const url = `/shoutouts/?${params.toString()}`;
      const response = await api.get(url);
      setShoutouts(response.data);
      
      fetchAllDepartments();
    } catch (err) {
      setError("Failed to load shout-outs");
      console.error("Error fetching shoutouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDepartments = async () => {
    try {
      const response = await api.get("/shoutouts/departments/all");
      if (response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      }
    } catch (err) {
      console.log("Could not fetch all departments");
    }
  };

  useEffect(() => {
    fetchShoutouts();
  }, [filterDepartment, filterSender, refreshTrigger]);

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

  const getReactionCount = (shoutout, type) => {
    return shoutout.reactions?.filter(r => r.type === type).length || 0;
  };

  const getUserReaction = (shoutout, type) => {
    return shoutout.reactions?.some(r => r.type === type && r.user?.id === user?.id);
  };

  const handleAddReaction = async (shoutoutId, type) => {
    try {
      const shoutout = shoutouts.find(s => s.id === shoutoutId);
      const isReacted = getUserReaction(shoutout, type);
      
      if (isReacted) {
        await api.delete(`/shoutouts/${shoutoutId}/react/${type}`);
      } else {
        await api.post(`/shoutouts/${shoutoutId}/react/${type}`);
      }
      
      // Refetch the updated shoutout to maintain scroll position
      const response = await api.get(`/shoutouts/${shoutoutId}`);
      setShoutouts(shoutouts.map(s => s.id === shoutoutId ? response.data : s));
    } catch (err) {
      console.error("Error adding reaction:", err);
      alert(err.response?.data?.detail || "Failed to add reaction. Please try again.");
    }
  };

  const handleDeleteShoutOut = async (shoutoutId) => {
    if (!window.confirm("Are you sure you want to delete this shout-out?")) {
      return;
    }

    try {
      await api.delete(`/shoutouts/${shoutoutId}`);
      // Remove the deleted shoutout from local state
      setShoutouts(shoutouts.filter(s => s.id !== shoutoutId));
    } catch (err) {
      console.error("Error deleting shout-out:", err);
      alert(err.response?.data?.detail || "Failed to delete shout-out. Please try again.");
    }
  };

  const handleAddComment = async (shoutoutId) => {
    const content = commentInput[shoutoutId]?.trim();
    if (!content) return;

    try {
      const response = await api.post(`/shoutouts/${shoutoutId}/comments`, { content });
      // Update local state - add comment
      setShoutouts(shoutouts.map(s => 
        s.id === shoutoutId 
          ? { ...s, comments: [...(s.comments || []), response.data] }
          : s
      ));
      setCommentInput({ ...commentInput, [shoutoutId]: "" });
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (shoutoutId, commentId) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }
    
    try {
      await api.delete(`/shoutouts/comments/${commentId}`);
      // Refetch the updated shoutout to maintain sync
      const response = await api.get(`/shoutouts/${shoutoutId}`);
      setShoutouts(shoutouts.map(s => s.id === shoutoutId ? response.data : s));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.response?.data?.detail || "Failed to delete comment. Please try again.");
    }
  };

  const handleReportShoutOut = async (shoutoutId) => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting");
      return;
    }

    setReportLoading(true);
    try {
      await api.post(`/shoutouts/${shoutoutId}/report?reason=${encodeURIComponent(reportReason.trim())}`);
      alert("Report submitted successfully. Thank you for helping keep our community safe!");
      setShowReportModal(null);
      setReportReason("");
    } catch (err) {
      console.error("Error reporting shout-out:", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleCommentChange = (shoutoutId, value) => {
    setCommentInput({ ...commentInput, [shoutoutId]: value });
    
    // Check for mention trigger
    const lastWord = value.split(" ").pop();
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      setShowMentionDropdown({ ...showMentionDropdown, [shoutoutId]: true });
    } else if (!lastWord.startsWith("@")) {
      setShowMentionDropdown({ ...showMentionDropdown, [shoutoutId]: false });
    }
  };

  const handleMentionUser = (shoutoutId, userName) => {
    const input = commentInput[shoutoutId] || "";
    const words = input.split(" ");
    words[words.length - 1] = `@${userName}`;
    const newInput = words.join(" ") + " ";
    setCommentInput({ ...commentInput, [shoutoutId]: newInput });
    setShowMentionDropdown({ ...showMentionDropdown, [shoutoutId]: false });
  };

  const toggleComments = (shoutoutId) => {
    setExpandedComments({
      ...expandedComments,
      [shoutoutId]: !expandedComments[shoutoutId]
    });
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  const emojis = [
    "😀", "😂", "❤️", "👍", "🔥", "👏", "😍", "🎉", "✨", "🙌",
    "😎", "💪", "👌", "🚀", "💯", "🎊", "👏", "💝", "🌟", "⭐"
  ];

  const insertEmoji = (emoji, shoutoutId, type = "comment") => {
    if (type === "comment") {
      setCommentInput({
        ...commentInput,
        [shoutoutId]: (commentInput[shoutoutId] || "") + emoji
      });
    }
    setShowEmojiPicker({ ...showEmojiPicker, [shoutoutId]: false });
  };

  return (
    <div className="w-full pb-10">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Feed</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterDepartment("");
                setFilterSender("");
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Shout-Outs Feed */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading shout-outs...</p>
          </div>
        ) : shoutouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              No shout-outs yet. Be the first to send one! 🎉
            </p>
          </div>
        ) : (
          shoutouts.map((shoutout) => (
            <div key={shoutout.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
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
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                          ID: {shoutout.sender?.id}
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
                  <div className="flex items-center gap-2">
                    {shoutout.sender?.id === user?.id && (
                      <button
                        onClick={() => handleDeleteShoutOut(shoutout.id)}
                        className="text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                        title="Delete this shout-out"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowReportModal(shoutout.id)}
                      className="text-yellow-400 hover:text-yellow-600 px-2 py-1 rounded hover:bg-yellow-50 transition"
                      title="Report this shout-out"
                    >
                      <span className="text-lg">⚠️</span>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="text-xl">⋯</span>
                    </button>
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

                {/* Attachments Display */}
                {shoutout.attachments && shoutout.attachments.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-3">
                      {shoutout.attachments.map((attachment, idx) => (
                        <div key={attachment.id || idx}>
                          {attachment.file_type === "image" && (
                            <img
                              src={attachment.file_data}
                              alt={attachment.file_name}
                              className="max-h-48 max-w-full rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
                            />
                          )}
                          {attachment.file_type === "emoji" && (
                            <div className="text-5xl cursor-pointer hover:scale-110 transition">
                              {attachment.file_data}
                            </div>
                          )}
                          {attachment.file_type === "file" && (
                            <a
                              href={attachment.file_data}
                              download={attachment.file_name}
                              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg border border-gray-300 transition"
                            >
                              <span className="text-xl">📄</span>
                              <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                {attachment.file_name}
                              </span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
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
                                {comment.user?.id === user?.id && (
                                  <button
                                    onClick={() => handleDeleteComment(shoutout.id, comment.id)}
                                    className="text-red-500 hover:text-red-700 font-semibold"
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
                      <p className="text-center text-gray-500 text-sm py-4">
                        No comments yet
                      </p>
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                      <div className="flex-1 relative">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Add a comment... (use @name to mention)"
                            value={commentInput[shoutout.id] || ""}
                            onChange={(e) => handleCommentChange(shoutout.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleAddComment(shoutout.id);
                              }
                            }}
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() =>
                              setShowEmojiPicker({
                                ...showEmojiPicker,
                                [shoutout.id]: !showEmojiPicker[shoutout.id],
                              })
                            }
                            className="text-xl hover:scale-110 transition"
                          >
                            😊
                          </button>
                          <button
                            onClick={() => handleAddComment(shoutout.id)}
                            className="text-blue-500 hover:text-blue-600 font-semibold text-sm"
                          >
                            Post
                          </button>
                        </div>
                        
                        {/* Emoji Picker */}
                        {showEmojiPicker[shoutout.id] && (
                          <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 z-50">
                            {emojis.map((emoji, idx) => (
                              <button
                                key={idx}
                                onClick={() => insertEmoji(emoji, shoutout.id, "comment")}
                                className="text-xl hover:scale-125 transition cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Mention Dropdown */}
                        {showMentionDropdown[shoutout.id] && shoutouts.length > 0 && (
                          <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto z-50 w-48">
                            {shoutout.recipients && shoutout.recipients.length > 0 ? (
                              <div>
                                {shoutout.recipients.map((recipientObj) => (
                                  <button
                                    key={recipientObj.recipient.id}
                                    onClick={() => handleMentionUser(shoutout.id, recipientObj.recipient.name)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
                                  >
                                    <span className="font-semibold">@{recipientObj.recipient.name}</span>
                                    <span className="text-gray-500 text-xs ml-2">{recipientObj.recipient.department}</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs px-3 py-2">No users to mention</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Shout-Out</h2>
            <p className="text-gray-600 text-sm mb-4">
              Help us keep our community safe by reporting inappropriate content.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Report (5-500 characters)
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Explain why you're reporting this shout-out..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason("");
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReportShoutOut(showReportModal)}
                disabled={reportLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                {reportLoading ? "Reporting..." : "Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
