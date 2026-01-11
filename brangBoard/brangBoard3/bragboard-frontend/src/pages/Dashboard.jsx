import { useEffect, useState } from "react";
import api from "../services/api";
import CommentSection from "../components/CommentSection";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [feed, setFeed] = useState([]);
  const [reactions, setReactions] = useState({}); // 🔥 reaction counts

  // ---------------- LOAD USERS ----------------
  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- LOAD FEED ----------------
  const loadFeed = async () => {
    try {
      const res = await api.get("/shoutouts");
      setFeed(res.data);

      // load reactions for each shoutout
      res.data.forEach((s) => loadReactions(s.id));
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- LOAD REACTIONS ----------------
  const loadReactions = async (shoutoutId) => {
    try {
      const res = await api.get(`/reactions/${shoutoutId}`);
      setReactions((prev) => ({
        ...prev,
        [shoutoutId]: res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- POST SHOUTOUT ----------------
  const postShoutout = async () => {
    if (!message.trim()) {
      alert("Message required");
      return;
    }

    try {
      await api.post("/shoutouts", {
        sender_id: user.id,
        message,
        recipient_ids: recipients,
      });

      setMessage("");
      setRecipients([]);
      loadFeed();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- REACT (TOGGLE) ----------------
  const react = async (shoutoutId, type) => {
    try {
      await api.post(
        "/reactions",
        { shoutout_id: shoutoutId, type },
        { params: { user_id: user.id } }
      );

      loadReactions(shoutoutId); // 🔄 refresh count
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadFeed();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* CREATE SHOUTOUT */}
      <h1 className="text-2xl font-bold mb-4">Create Shout-out</h1>

      <textarea
        className="border w-full p-2 mb-3 rounded"
        placeholder="Write a shout-out..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <label className="block font-medium mb-1">About whom</label>
      <select
        multiple
        className="border w-full p-2 mb-3 rounded h-32"
        value={recipients}
        onChange={(e) =>
          setRecipients(
            Array.from(e.target.selectedOptions, (o) =>
              Number(o.value)
            )
          )
        }
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.department})
          </option>
        ))}
      </select>

      <button
        onClick={postShoutout}
        className="bg-black text-white px-4 py-2 rounded mb-6"
      >
        Post Shout-out
      </button>

      {/* FEED */}
      <h2 className="text-xl font-bold mb-3">Feed</h2>

      {feed.length === 0 && (
        <p className="text-gray-500">No shout-outs yet</p>
      )}

      {feed.map((s) => (
        <div key={s.id} className="border rounded p-4 mb-4">
          <p className="font-semibold">{s.sender}</p>
          <p className="my-1">{s.message}</p>

          <p className="text-sm text-gray-600 mb-2">
            For: {s.recipients?.join(", ") || "—"}
          </p>

          {/* REACTIONS WITH COUNT */}
          <div className="flex gap-6 mb-2 text-sm">
            <button onClick={() => react(s.id, "like")}>
              👍 {reactions[s.id]?.like || 0}
            </button>
            <button onClick={() => react(s.id, "clap")}>
              👏 {reactions[s.id]?.clap || 0}
            </button>
            <button onClick={() => react(s.id, "star")}>
              ⭐ {reactions[s.id]?.star || 0}
            </button>
          </div>

          {/* COMMENTS */}
          <CommentSection shoutoutId={s.id} userId={user.id} />
        </div>
      ))}
    </div>
  );
}
