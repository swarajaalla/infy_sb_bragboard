import { useEffect, useState } from "react";
import api from "../services/api";

export default function CommentSection({ shoutoutId, userId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const loadComments = async () => {
    const res = await api.get(`/comments/${shoutoutId}`);
    setComments(res.data);
  };

  const postComment = async () => {
    await api.post("/comments", {
      shoutout_id: shoutoutId,
      text
    }, { params: { user_id: userId } });

    setText("");
    loadComments();
  };

  useEffect(() => {
    loadComments();
  }, []);

  return (
    <div className="mt-2">
      {comments.map((c, i) => (
        <p key={i} className="text-sm">
          <b>{c.user}:</b> {c.text}
        </p>
      ))}

      <div className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-1 text-sm flex-1"
          placeholder="Add comment..."
        />
        <button
          onClick={postComment}
          className="text-sm bg-gray-200 px-2"
        >
          Post
        </button>
      </div>
    </div>
  );
}
