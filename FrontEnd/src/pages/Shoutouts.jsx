import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const departmentColors = {
  HR: "#9333ea",           // Purple
  Engineering: "#2563eb",  // Blue
  Sales: "#f97316",        // Orange
  Intern: "#16a34a",       // Green
  Trainee: "#0ea5e9",      // Sky
  Employee: "#64748b"      // Gray
};


export default function Shoutouts() {
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();
const [selectedRole, setSelectedRole] = useState("Employee");

const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileStats, setProfileStats] = useState({
    sent: 0,
    received: 0
  });
  const [peers, setPeers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [reactions, setReactions] = useState({});

  const [comments, setComments] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");


  /* ---------------- LOAD PEERS ---------------- */
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/auth/department-peers", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setPeers(res.data.peers || []))
      .catch(() => setPeers([]));
  }, []);



  const preloadReactions = async (list) => {
  for (let s of list) {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/shoutouts/${s.id}/reactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReactions(prev => ({ ...prev, [s.id]: res.data }));
    } catch {
      setReactions(prev => ({ ...prev, [s.id]: { like: 0, clap: 0, star: 0 } }));
    }
  }
};


const fetchUsers = async (role) => {
  setSelectedRole(role);

  const res = await axios.get(
  `http://127.0.0.1:8000/auth/users/by-role?role=${role}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setPeers(res.data);
};


  /* ---------------- LOAD SHOUTOUTS ---------------- */
  const loadUser = async (user) => {
  setSelectedUser(user);
  setOpenComments({});
  setComments({});

  const res = await axios.get(
    `http://127.0.0.1:8000/shoutouts/user/${user.id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const sentData = res.data.sent || [];
  const receivedData = res.data.received || [];

  setSent(sentData);
  setReceived(receivedData);

  // 🔥 LOAD reactions for ALL shoutouts
  [...sentData, ...receivedData].forEach(s => {
    loadReactions(s.id);
  });
};

const openProfile = async (user) => {
  setProfileUser(user);
  setShowProfile(true);

  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/shoutouts/user/${user.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setProfileStats({
      sent: res.data.sent?.length || 0,
      received: res.data.received?.length || 0
    });
  } catch {
    setProfileStats({ sent: 0, received: 0 });
  }
};




  /* ---------------- COMMENTS ---------------- */
  const toggleComments = (id) => {
  setOpenComments(prev => ({
    ...prev,
    [id]: !prev[id]
  }));

  if (!comments[id]) {
    loadComments(id);
  }
};



  const addComment = async (id) => {
  const text = newComment[id];
  if (!text || !text.trim()) return;

  await axios.post(
    `http://127.0.0.1:8000/shoutouts/${id}/comments`,
    { content: text },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // reload comments
  await loadComments(id);

  // clear input
  setNewComment(prev => ({ ...prev, [id]: "" }));
};





  const reactToShoutout = async (id, type) => {
  await axios.post(
    `http://127.0.0.1:8000/shoutouts/${id}/react`,
    { type },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  await loadReactions(id);
};





const loadReactions = async (id) => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/shoutouts/${id}/reactions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReactions(prev => ({
      ...prev,
      [id]: {
        like: res.data?.like ?? 0,
        clap: res.data?.clap ?? 0,
        star: res.data?.star ?? 0
      }
    }));
  } catch (err) {
    console.error("Failed to load reactions", err);
  }
};


const loadComments = async (id) => {
  const res = await axios.get(
    `http://127.0.0.1:8000/shoutouts/${id}/comments`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setComments(prev => ({
    ...prev,
    [id]: res.data
  }));
};

const updateComment = async (commentId, shoutoutId) => {
  if (!editingText.trim()) return;

  await axios.put(
    `http://127.0.0.1:8000/shoutouts/comments/${commentId}`,
    { content: editingText },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setEditingCommentId(null);
  setEditingText("");
  loadComments(shoutoutId);
};

const deleteComment = async (commentId, shoutoutId) => {
  if (!window.confirm("Delete this comment?")) return;

  await axios.delete(
    `http://127.0.0.1:8000/shoutouts/comments/${commentId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  loadComments(shoutoutId);
};


  /* ---------------- STYLES ---------------- */
  const card = {
    background: "#ffffff",
    borderLeft: "4px solid #2563eb",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  };

  const sectionTitle = {
    color: "#2563eb",
    marginBottom: "10px"
  };

  const button = {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "6px"
  };

  const reactionBtn = {
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "6px 10px",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "14px"
};

const timeAgo = (date) => {
  if (!date) return "";

  // Parse backend datetime
  const created = new Date(date.replace(" ", "T"));

  // 🔥 ADD IST OFFSET (+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const createdIST = new Date(created.getTime() + IST_OFFSET);

  const now = new Date();
  const seconds = Math.floor((now - createdIST) / 1000);

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};



const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "#2563eb",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  flexShrink: 0
};

const commentBox = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "10px 12px",
  width: "100%"
};



  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "24px" }}>

      {/* HEADER */}
      <div style={{
        background: "#fff",
        padding: "16px 20px",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
      }}>
        <h2 style={{ color: "#2563eb" }}>🎉 Shoutouts</h2>
        <button style={button} onClick={() => navigate("/dashboard")}>
          ⬅ Back
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{
        display: "flex",
        background: "#fff",
        borderRadius: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
      }}>

        {/* LEFT – PEERS */}
        <div style={{
          width: "25%",
          borderRight: "1px solid #e5e7eb",
          padding: "16px"
        }}>
          <h4 style={{ marginBottom: "12px", color: "#121a2bff" }}> Department Peers</h4>

          {peers.map(p => (
  <div
    key={p.id}
    onClick={() => loadUser(p)}   // normal behavior
    style={{
      display: "flex",
      gap: "10px",
      alignItems: "center",
      padding: "10px",
      marginBottom: "8px",
      cursor: "pointer",
      borderRadius: "8px",
      background:
        selectedUser?.id === p.id ? "#e0f2fe" : "#f8fafc",
      border: "1px solid #e5e7eb"
    }}
  >

    {/* 👤 AVATAR → PROFILE POPUP */}
    <div
      onClick={(e) => {
        e.stopPropagation();     // 🔥 IMPORTANT
        openProfile(p);
      }}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "#2563eb",
        color: "#fff",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0
      }}
    >
      {p.name[0]}
    </div>

    {/* USER INFO */}
    <div>
      <b style={{ color: "#1e293b" }}>{p.name}</b>
      <div style={{ fontSize: "12px", color: "#64748b" }}>
        {p.email} • {p.role}
      </div>
    </div>

  </div>
))}

          {/* {peers.map(p => (
            <div
              key={p.id}
              onClick={() => openProfile(p)}
              style={{
                padding: "10px",
                marginBottom: "8px",
                cursor: "pointer",
                borderRadius: "8px",
                background:
                  selectedUser?.id === p.id ? "#e0f2fe" : "#f8fafc",
                border: "1px solid #e5e7eb"
              }}
            >
              <b style={{ color: "#2563eb" }}>{p.name}</b>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {p.email} • {p.role}
                </div>

            </div>
          ))} */}
        </div>


        {/* RIGHT – ACTIVITY */}
        <div style={{ width: "75%", padding: "20px" }}>
          {!selectedUser ? (
  <div style={{ color: "#64748b" }}>
    Select a peer to view shoutouts
  </div>
) : (
  <div>
    <h3 style={{ color: "#262f43ff" }}>{selectedUser.name}</h3>
    <p style={{ color: "#344f74ff" }}>{selectedUser.email}</p>

    <div style={{
      background: "#f8fafc",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "12px",
      border: "1px solid #e5e7eb"
    }}>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
  <span style={{
    backgroundColor: departmentColors[selectedUser.role] || "#64748b",
    color: "white",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600"
  }}>
    <b>Role: </b> 
    {selectedUser.role}
    <br />
  </span>

  <span style={{
    backgroundColor: departmentColors[selectedUser.department] || "#94a3b8",
    color: "white",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600"
  }}>
    <b>Department: </b>
    {selectedUser.department}
    <br />
  </span>
</div>

    </div>
  </div>
)}
              {/* SENT */}
              <h4 style={sectionTitle}>📤 Sent Shoutouts ({sent.length})</h4>
              {sent.length === 0 && <p style={{ color: "#64748b" }}>No sent shoutouts</p>}
{sent.map(s => (
  <div key={s.id} style={card}>

    {/* Shoutout Body */}
    <div style={{ display: "flex", gap: "10px" }}>
      <div style={avatarStyle}>
        {(s.to || "U")[0].toUpperCase()}
      </div>

      <div style={{ width: "100%" }}>
        <div style={commentBox}>
          <p style={{ color: "#1e3a8a", margin: 0 }}>
            <b>To:</b> {JSON.parse(localStorage.getItem("user"))?.name || "You"}
          </p>

          <p style={{ marginTop: "6px", color: "#0f172a" }}>
            {s.message}
          </p>

          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {timeAgo(s.created_at)}
          </div>
        </div>
      </div>
    </div>

    {/* 🔥 REACTIONS + COMMENTS (HORIZONTAL) */}
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginTop: "10px",
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      <button onClick={() => reactToShoutout(s.id, "like")} style={reactionBtn}>
        👍 {reactions[s.id]?.like || 0}
      </button>

      <button onClick={() => reactToShoutout(s.id, "clap")} style={reactionBtn}>
        👏 {reactions[s.id]?.clap || 0}
      </button>

      <button onClick={() => reactToShoutout(s.id, "star")} style={reactionBtn}>
        ⭐ {reactions[s.id]?.star || 0}
      </button>

      <button
        onClick={() => toggleComments(s.id)}
        style={{
          background: "#e0f2fe",
          border: "1px solid #38bdf8",
          color: "#0369a1",
          padding: "6px 14px",
          borderRadius: "20px",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        💬 Comments
      </button>
    </div>

    {/* COMMENTS SECTION */}
    {openComments[s.id] && (
      <div>
                      {comments[s.id]?.length === 0 && (
                        <p style={{ fontSize: "13px", color: "#64748b" }}>
                          Be the first to comment
                        </p>
                      )}

                      {comments[s.id]?.map(c => (
                        <div key={c.id} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>

  {/* Avatar */}
  <div style={avatarStyle}>
    {(c.user || "U")[0].toUpperCase()}
  </div>

  {/* Comment Body */}
  <div style={{ width: "100%", position: "relative" }}>
    <div style={commentBox}>

      {/* Header row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <b style={{ color: "#1e3a8a" }}>
          {Number(c.user_id) === Number(currentUserId) ? "You" : c.user}
        </b>

        {Number(c.user_id) === Number(currentUserId) && (
          <span
            style={{ cursor: "pointer", fontSize: "23px", color: "black" }}
            onClick={() =>
              setOpenMenuId(openMenuId === c.id ? null : c.id)
            }
          >
            ⋮
          </span>
        )}
      </div>

      {/* Content */}
      {editingCommentId === c.id ? (
        <div>
          <input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            style={{ width: "100%", marginTop: "6px" }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <button style={button} onClick={() => updateComment(c.id, s.id)}>
              Save
            </button>
            <button
              style={{ ...button, background: "#64748b" }}
              onClick={() => setEditingCommentId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: "6px", color: "#0f172a" }}>
          {c.content}
        </p>
      )}

      {/* Time */}
      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
        {timeAgo(c.created_at)}
      </div>
    </div>

    {/* Dropdown */}
    {openMenuId === c.id && (
      <div style={{
        position: "absolute",
        top: "32px",
        right: "8px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 10
      }}>
        <div
          style={{ padding: "8px", cursor: "pointer", color: "black" }}
          onClick={() => {
            setEditingCommentId(c.id);
            setEditingText(c.content);
            setOpenMenuId(null);
          }}
        >
          ✏️ Edit
        </div>
        <div
          style={{ padding: "8px", color: "red", cursor: "pointer" }}
          onClick={() => {
            deleteComment(c.id, s.id);
            setOpenMenuId(null);
          }}
        >
          🗑 Delete
        </div>
      </div>
    )}
  </div>
</div>

))}


                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <div style={avatarStyle}>
    {(JSON.parse(localStorage.getItem("user"))?.name || "U")[0]}
  </div>

  <input
    placeholder="Add a comment..."
    value={newComment[s.id] || ""}
    onChange={(e) =>
      setNewComment(prev => ({ ...prev, [s.id]: e.target.value }))
    }
    style={{
      flex: 1,
      padding: "10px",
      borderRadius: "20px",
      border: "1px solid #e5e7eb"
    }}
  />

  <button style={button} onClick={() => addComment(s.id)}>
    Post
  </button>
</div>

                    </div>
    )}

  </div>
))}

<hr style={{ margin: "16px 0" }} />

              {/* RECEIVED */}
              <h4 style={sectionTitle}>📥 Received Shoutouts ({received.length})</h4>
              {received.length === 0 && <p style={{ color: "#64748b" }}>No received shoutouts</p>}

              {received.map(r => (
                <div key={r.id} style={card}>

    {/* Shoutout Body */}
    <div style={{ display: "flex", gap: "10px" }}>
      <div style={avatarStyle}>
        {(r.to || "U")[0].toUpperCase()}
      </div>

      <div style={{ width: "100%" }}>
        <div style={commentBox}>
          <p style={{ color: "#1e3a8a", margin: 0 }}>
            <b>To:</b> {JSON.parse(localStorage.getItem("user"))?.name || "You"}
          </p>

          <p style={{ marginTop: "6px", color: "#0f172a" }}>
            {r.message}
          </p>

          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {timeAgo(r.created_at)}
          </div>
        </div>
      </div>
    </div>

    {/* 🔥 REACTIONS + COMMENTS (HORIZONTAL) */}
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginTop: "10px",
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      <button onClick={() => reactToShoutout(r.id, "like")} style={reactionBtn}>
        👍 {reactions[r.id]?.like || 0}
      </button>

      <button onClick={() => reactToShoutout(r.id, "clap")} style={reactionBtn}>
        👏 {reactions[r.id]?.clap || 0}
      </button>

      <button onClick={() => reactToShoutout(r.id, "star")} style={reactionBtn}>
        ⭐ {reactions[r.id]?.star || 0}
      </button>

      <button
        onClick={() => toggleComments(r.id)}
        style={{
          background: "#e0f2fe",
          border: "1px solid #38bdf8",
          color: "#0369a1",
          padding: "6px 14px",
          borderRadius: "20px",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        💬 Comments
      </button>
    </div>

    {/* COMMENTS SECTION */}
    {openComments[r.id] && (
      <div>
                      {comments[r.id]?.length === 0 && (
                        <p style={{ fontSize: "13px", color: "#64748b" }}>
                          Be the first to comment
                        </p>
                      )}

                      {comments[r.id]?.map(c => (
                        <div key={c.id} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>

  {/* Avatar */}
  <div style={avatarStyle}>
    {(c.user || "U")[0].toUpperCase()}
  </div>

  {/* Comment Body */}
  <div style={{ width: "100%", position: "relative" }}>
    <div style={commentBox}>

      {/* Header row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <b style={{ color: "#1e3a8a" }}>
          {Number(c.user_id) === Number(currentUserId) ? "You" : c.user}
        </b>

        {Number(c.user_id) === Number(currentUserId) && (
          <span
            style={{ cursor: "pointer", fontSize: "23px", color: "black" }}
            onClick={() =>
              setOpenMenuId(openMenuId === c.id ? null : c.id)
            }
          >
            ⋮
          </span>
        )}
      </div>

      {/* Content */}
      {editingCommentId === c.id ? (
        <div>
          <input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            style={{ width: "100%", marginTop: "6px" }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <button style={button} onClick={() => updateComment(c.id, r.id)}>
              Save
            </button>
            <button
              style={{ ...button, background: "#64748b" }}
              onClick={() => setEditingCommentId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: "6px", color: "#0f172a" }}>
          {c.content}
        </p>
      )}

      {/* Time */}
      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
        {timeAgo(c.created_at)}
      </div>
    </div>

    {/* Dropdown */}
    {openMenuId === c.id && (
      <div style={{
        position: "absolute",
        top: "32px",
        right: "8px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 10
      }}>
        <div
          style={{ padding: "8px", cursor: "pointer", color: "black" }}
          onClick={() => {
            setEditingCommentId(c.id);
            setEditingText(c.content);
            setOpenMenuId(null);
          }}
        >
          ✏️ Edit
        </div>
        <div
          style={{ padding: "8px", color: "red", cursor: "pointer" }}
          onClick={() => {
            deleteComment(c.id, r.id);
            setOpenMenuId(null);
          }}
        >
          🗑 Delete
        </div>
      </div>
    )}
  </div>
</div>

))}


                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <div style={avatarStyle}>
    {(JSON.parse(localStorage.getItem("user"))?.name || "U")[0]}
  </div>

  <input
    placeholder="Add a comment..."
    value={newComment[r.id] || ""}
    onChange={(e) =>
      setNewComment(prev => ({ ...prev, [r.id]: e.target.value }))
    }
    style={{
      flex: 1,
      padding: "10px",
      borderRadius: "20px",
      border: "1px solid #e5e7eb"
    }}
  />

  <button style={button} onClick={() => addComment(r.id)}>
    Post
  </button>
</div>

                    </div>
    )}

  </div>
          ))}
          </div>
        </div>

        {showProfile && profileUser && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  }}>
    <div style={{
      width: "340px",
      background: "#ffffff",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
    }}>

      {/* Avatar */}
      <div style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "#2563eb",
        color: "#fff",
        fontSize: "24px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px"
      }}>
        {profileUser.name[0]}
      </div>

      {/* Name */}
      <h3 style={{ textAlign: "center", margin: 0,  color: "#262f43ff" }}>
        {profileUser.name}
      </h3>

      <p style={{
        textAlign: "center",
        color: "#64748b",
        fontSize: "14px",
        marginTop: "4px"
      }}>
        {profileUser.role} • {profileUser.department}
      </p>

      <hr style={{ margin: "16px 0" }} />

      {/* Stats */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        textAlign: "center"
      }}>
        <div>
          <b style={{color:"black"}}>{profileStats.sent}</b>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Sent
          </div>
        </div>

        <div>
          <b style={{color:"black"}}>{profileStats.received}</b>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Received
          </div>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={() => setShowProfile(false)}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}


      </div>
  );
}
