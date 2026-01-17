import { useEffect, useState } from "react";
import { getComments, createComment } from "../../api/comments";
import { formatDateTime } from "../../utils/date";
import axiosClient from "../../api/axiosClient";


export default function CommentSection({
  shoutoutId,
  allowComment,
  currentUser,
  recipients,
}) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await getComments(shoutoutId);
      setComments(res.data);
    };
    load();
  }, [shoutoutId]);

  const handlePost = async () => {
    if (!content.trim()) return;
    await createComment(shoutoutId, content);
    const res = await getComments(shoutoutId);
    setComments(res.data);
    setContent("");
  };

  const visibleComments = comments.filter((c) => {
    if (currentUser.role === "admin") return true;
    if (c.user.id === currentUser.id) return true;

    return recipients.some((r) => r.id === currentUser.id);
  });

  const handleDeleteComment = async (commentId) => {
  if (!confirm("Delete this comment?")) return;

  try {
    await axiosClient.delete(`/api/comments/${commentId}`);
    const res = await getComments(shoutoutId);
    setComments(res.data);
  } catch (e) {
    alert("Failed to delete comment");
  }
};


  return (
    <div className="pt-3 space-y-3">
      {visibleComments.map((c) => (
  <div key={c.id} className="text-sm bg-white rounded-lg p-2 border">
    <div className="flex justify-between items-center">
      <div>
        <span className="font-semibold">{c.user.name}</span>
        <span className="text-xs text-gray-500 ml-2">
          ({c.user.department})
        </span>
      </div>

      {(currentUser.role === "admin" ||
        c.user.id === currentUser.id) && (
        <button
          onClick={() => handleDeleteComment(c.id)}
          className="text-xs text-red-600 hover:underline"
        >
          🗑️ Delete
        </button>
      )}
    </div>

    <p className="mt-1">{c.content}</p>

    <p className="text-xs text-gray-400">
      {formatDateTime(c.created_at)}
    </p>
  </div>
))}


      {allowComment && currentUser.role !== "admin" && (
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg p-2 text-sm"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={handlePost}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
