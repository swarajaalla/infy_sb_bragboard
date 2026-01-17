import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";
import { formatDateTime } from "../../utils/date";
import { reportShoutout } from "../../api/reports";
import axiosClient from "../../api/axiosClient";

export default function ShoutoutCard({
  shoutout,
  allowReact,
  allowComment,
  currentUser,
}) {
  const handleReport = async () => {
    const reason = prompt("Why are you reporting this shout-out?");
    if (!reason) return;

    try {
      await reportShoutout(shoutout.id, reason);
      alert("Shout-out reported successfully");
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to report");
    }
  };

  const handleDeleteShoutout = async () => {
    if (!confirm("Delete this shout-out?")) return;

    try {
      await axiosClient.delete(`/api/shoutouts/${shoutout.id}`);
      alert("Shout-out deleted. Refresh the page.");
    } catch (e) {
      alert("Failed to delete shout-out");
    }
  };

  return (
    <div className="p-4 bg-indigo-50 rounded-lg space-y-3">
      <p className="text-sm text-gray-800">{shoutout.message}</p>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>
          From {shoutout.sender?.name} •{" "}
          {formatDateTime(shoutout.created_at)}
        </span>

        {/* 🚩 Report (employee, not own shoutout) */}
        {currentUser.role === "employee" &&
          shoutout.sender?.id !== currentUser.id && (
            <button
              onClick={handleReport}
              className="text-red-600 hover:underline"
            >
              🚩 Report
            </button>
          )}

        {/* 🗑️ Delete (admin OR owner) */}
        {(currentUser.role === "admin" ||
          shoutout.sender?.id === currentUser.id) && (
          <button
            onClick={handleDeleteShoutout}
            className="text-red-600 hover:underline"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Reactions */}
      <ReactionBar
        shoutoutId={shoutout.id}
        allowReact={allowReact}
        showWhenEmpty={allowReact}
      />

      {/* Comments */}
      <CommentSection
        shoutoutId={shoutout.id}
        allowComment={allowComment}
        currentUser={currentUser}
        recipients={shoutout.recipients}
      />
    </div>
  );
}
