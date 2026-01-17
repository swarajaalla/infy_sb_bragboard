import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import ShoutoutSection from "../dashboard/ShoutoutSection";
import { formatDateTime } from "../../utils/date";


export default function EmployeeInspector({ employee }) {
  const [tab, setTab] = useState("shoutouts");
  const [shoutouts, setShoutouts] = useState([]);
  const [commentsMade, setCommentsMade] = useState([]);
  const [commentsReceived, setCommentsReceived] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employee) return;

    const loadData = async () => {
      setLoading(true);

      try {
        // 1️⃣ Load all shoutouts
        const shoutRes = await axiosClient.get("/api/shoutouts");
        const allShoutouts = shoutRes.data;
        setShoutouts(allShoutouts);

        let made = [];
        let received = [];

        // 2️⃣ Load comments per shoutout
        for (const s of allShoutouts) {
          const res = await axiosClient.get("/api/comments", {
            params: { shoutout_id: s.id },
          });

          for (const c of res.data) {
            // Comments MADE by employee
            if (c.user.id === employee.id) {
              made.push({ ...c, shoutout: s });
            }

            // Comments RECEIVED by employee
            if (
              s.sender?.id === employee.id &&
              c.user.id !== employee.id
            ) {
              received.push({ ...c, shoutout: s });
            }
          }
        }

        setCommentsMade(made);
        setCommentsReceived(received);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employee]);

  if (!employee) {
    return (
      <div className="text-gray-500 text-sm">
        Select an employee to inspect
      </div>
    );
  }

  // 🔹 Shoutout filtering
  const posted = shoutouts.filter(
    (s) => s.sender?.id === employee.id
  );

  const receivedShoutouts = shoutouts.filter((s) =>
    s.recipients?.some((r) => r.id === employee.id)
  );

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow border p-4">
        <h2 className="text-lg font-semibold">{employee.name}</h2>
        <p className="text-sm text-gray-500">
          {employee.department} • {employee.role}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("shoutouts")}
          className={`px-3 py-1 rounded text-sm ${
            tab === "shoutouts"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Shoutouts
        </button>

        <button
          onClick={() => setTab("comments")}
          className={`px-3 py-1 rounded text-sm ${
            tab === "comments"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Comments
        </button>
      </div>

      {/* CONTENT */}
      {loading && (
        <p className="text-sm text-gray-400">Loading…</p>
      )}

      {!loading && tab === "shoutouts" && (
        <div className="space-y-6">
          <ShoutoutSection
            title="Posted by Employee"
            shoutouts={posted}
            type="sent"
            currentUser={{ role: "admin" }}
          />

          <ShoutoutSection
            title="Received by Employee"
            shoutouts={receivedShoutouts}
            type="received"
            currentUser={{ role: "admin" }}
          />
        </div>
      )}

      {!loading && tab === "comments" && (
        <div className="space-y-6">
          {/* COMMENTS MADE */}
          <div>
            <p className="font-semibold text-sm mb-2">
              Comments made
            </p>
            {commentsMade.length === 0 ? (
              <p className="text-xs text-gray-400">
                No comments made
              </p>
            ) : (
              commentsMade.map((c) => (
                <div
  key={`made-${c.id}`}
  className="text-sm bg-gray-50 border rounded p-2 mb-2"
>
  <p>{c.content}</p>
  <p className="text-xs text-gray-400 mt-1">
    {formatDateTime(c.created_at)}
  </p>
</div>

              ))
            )}
          </div>

          {/* COMMENTS RECEIVED */}
          <div>
            <p className="font-semibold text-sm mb-2">
              Comments received
            </p>
            {commentsReceived.length === 0 ? (
              <p className="text-xs text-gray-400">
                No comments received
              </p>
            ) : (
              commentsReceived.map((c) => (
                <div
  key={`rec-${c.id}`}
  className="text-sm bg-gray-50 border rounded p-2 mb-2"
>
  <p>{c.content}</p>
  <p className="text-xs text-gray-400 mt-1">
    By {c.user.name} • {formatDateTime(c.created_at)}
  </p>
</div>

              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
