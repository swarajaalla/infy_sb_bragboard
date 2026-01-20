import { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function CommentsSection({ shoutoutId, comments, onCommentAdded }) {
  const { user } = useContext(AuthContext);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(comments || []);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [commentReactions, setCommentReactions] = useState({});
  const [reportReason, setReportReason] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState(null);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/shoutouts/${shoutoutId}/comments`, {
        content: commentText,
      });

      setLocalComments([response.data, ...localComments]);
      setCommentText("");
      onCommentAdded && onCommentAdded();
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  // Save scroll position before deletion
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      // Save current scroll position
      const currentScroll = window.scrollY;
      setScrollPosition(currentScroll);
      
      // Find the comment to restore if deletion fails
      const commentToDelete = localComments.find(c => c.id === commentId);
      
      try {
        // Optimistic UI update - remove comment immediately
        const updatedComments = localComments.filter((c) => c.id !== commentId);
        setLocalComments(updatedComments);
        
        // Then make the API call
        await api.delete(`/shoutouts/comments/${commentId}`);
        
        alert("Comment deleted successfully!");
        
        // Restore scroll position after state update
        setTimeout(() => {
          window.scrollTo(0, currentScroll);
        }, 0);
      } catch (err) {
        console.error("Failed to delete comment:", err);
        console.error("Error response:", err.response);
        
        // Restore the comment if deletion failed
        if (commentToDelete) {
          setLocalComments([...localComments, commentToDelete]);
        }
        
        const errorMsg = err.response?.data?.detail || "Failed to delete comment. Please try again.";
        alert(errorMsg);
      }
    }
  };

  const handleReactToComment = async (commentId, reactionType) => {
    try {
      await api.post(`/shoutouts/comments/${commentId}/react/${reactionType}`);
      setCommentReactions({
        ...commentReactions,
        [commentId]: reactionType
      });
    } catch (err) {
      console.error("Failed to react:", err);
      alert("Failed to add reaction");
    }
  };

  const handleRemoveCommentReaction = async (commentId, reactionType) => {
    try {
      await api.delete(`/shoutouts/comments/${commentId}/react/${reactionType}`);
      const newReactions = { ...commentReactions };
      delete newReactions[commentId];
      setCommentReactions(newReactions);
    } catch (err) {
      console.error("Failed to remove reaction:", err);
      alert("Failed to remove reaction");
    }
  };

  const handleReportComment = async (commentId) => {
    if (!reportReason.trim()) {
      alert("Please enter a reason");
      return;
    }

    try {
      await api.post(`/shoutouts/comments/${commentId}/report?reason=${encodeURIComponent(reportReason)}`);
      alert("Comment reported successfully");
      setReportingCommentId(null);
      setReportReason("");
    } catch (err) {
      console.error("Failed to report:", err);
      const errorMsg = err.response?.data?.detail || "Failed to report comment";
      alert(errorMsg);
    }
  };

  const displayComments = showAll ? localComments : localComments.slice(0, 2);

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4">
      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="mb-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
              disabled={loading}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCommentText("")}
                className="px-3 py-1 text-gray-600 text-sm hover:bg-gray-200 rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !commentText.trim()}
                className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {displayComments.map((comment) => (
          <div key={comment.id} className="bg-white rounded p-3 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">{comment.user.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {user?.id === comment.user.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 text-xs hover:text-red-800 transition font-medium"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setReportingCommentId(reportingCommentId === comment.id ? null : comment.id)}
                  className="text-orange-600 text-xs hover:text-orange-800 transition font-medium"
                >
                  Report
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

            {/* Report Form */}
            {reportingCommentId === comment.id && (
              <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-2">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this comment?"
                  className="w-full px-2 py-1 text-xs border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                  rows="2"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleReportComment(comment.id)}
                    className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                  >
                    Report
                  </button>
                  <button
                    onClick={() => {
                      setReportingCommentId(null);
                      setReportReason("");
                    }}
                    className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reactions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => commentReactions[comment.id] === "heart" 
                  ? handleRemoveCommentReaction(comment.id, "heart")
                  : handleReactToComment(comment.id, "heart")
                }
                className={`text-sm transition ${
                  commentReactions[comment.id] === "heart"
                    ? "text-red-600 font-semibold"
                    : "text-gray-600 hover:text-red-600"
                }`}
              >
                ❤️ Heart
              </button>
              <button
                onClick={() => commentReactions[comment.id] === "thumbs_up"
                  ? handleRemoveCommentReaction(comment.id, "thumbs_up")
                  : handleReactToComment(comment.id, "thumbs_up")
                }
                className={`text-sm transition ${
                  commentReactions[comment.id] === "thumbs_up"
                    ? "text-yellow-600 font-semibold"
                    : "text-gray-600 hover:text-yellow-600"
                }`}
              >
                👍 Thumbs Up
              </button>
              <button
                onClick={() => commentReactions[comment.id] === "clap"
                  ? handleRemoveCommentReaction(comment.id, "clap")
                  : handleReactToComment(comment.id, "clap")
                }
                className={`text-sm transition ${
                  commentReactions[comment.id] === "clap"
                    ? "text-orange-600 font-semibold"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                👏 Clap
              </button>
            </div>
          </div>
        ))}

        {localComments.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first!</p>
        )}
      </div>

      {/* Show More Button */}
      {localComments.length > 2 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 py-2 text-blue-600 text-sm hover:bg-gray-200 rounded transition"
        >
          Show {localComments.length - 2} more comment{localComments.length !== 3 ? "s" : ""}
        </button>
      )}

      {showAll && localComments.length > 2 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full mt-3 py-2 text-gray-600 text-sm hover:bg-gray-200 rounded transition"
        >
          Show Less
        </button>
      )}
    </div>
  );
}
