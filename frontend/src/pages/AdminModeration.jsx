import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllShoutoutsAdmin,
  adminDeleteShoutout,
  adminDeleteComment,
  getCurrentUser,
  getReportedShoutouts,
  resolveReport,
} from "../services/api";

function AdminModeration() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [shoutouts, setShoutouts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await getCurrentUser(token);

        if (userRes.data.role !== "admin") {
          alert("Access denied");
          navigate("/dashboard");
          return;
        }

        setUser(userRes.data);

        const [shoutRes, reportRes] = await Promise.all([
          getAllShoutoutsAdmin(token),
          getReportedShoutouts(token),
        ]);

        setShoutouts(shoutRes.data);
        setReports(reportRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert("Failed to load moderation data");
        }
      }
    };

    loadData();
  }, [token, navigate]);

  const handleDeleteShoutout = async (id) => {
    if (!window.confirm("Delete this shoutout permanently?")) return;
    await adminDeleteShoutout(token, id);
    setShoutouts((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteComment = async (commentId, shoutoutId) => {
    if (!window.confirm("Delete this comment?")) return;
    await adminDeleteComment(token, commentId);

    setShoutouts((prev) =>
      prev.map((s) =>
        s.id === shoutoutId
          ? { ...s, comments: s.comments.filter((c) => c.id !== commentId) }
          : s
      )
    );
  };

  const handleResolveReport = async (reportId) => {
    await resolveReport(token, reportId);
    setReports((prev) => prev.filter((r) => r.report_id !== reportId));
  };

  if (loading) return <p className="p-10">Loading moderation panel...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">
      <h2 className="text-4xl font-bold mb-10 text-indigo-700">
        Admin Moderation
      </h2>

      {/* 🚨 REPORTED SHOUTOUTS */}
      <h3 className="text-xl font-bold mb-4">🚨 Reported Shoutouts</h3>

      {reports.length === 0 ? (
        <p className="text-gray-500 mb-10">No pending reports 🎉</p>
      ) : (
        reports.map((r) => (
          <div key={r.report_id} className="bg-red-50 border rounded-lg p-4 mb-4">
            <p className="font-semibold">
              {r.shoutout?.from_user} → {r.shoutout?.to_user}
            </p>
            <p>{r.shoutout?.message}</p>
            <p className="text-sm text-red-600">Reason: {r.reason}</p>

            <button
              onClick={() => handleResolveReport(r.report_id)}
              className="mt-2 text-green-700 font-semibold"
            >
              Resolve
            </button>
          </div>
        ))
      )}

      {/* 📣 ALL SHOUTOUTS */}
      <h3 className="text-xl font-bold mb-4">📣 All Shoutouts</h3>

      {shoutouts.length === 0 ? (
        <p className="text-gray-500">No shoutouts found</p>
      ) : (
        shoutouts.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex justify-between mb-2">
              <p className="font-semibold">
                {s.from_user?.name} → {s.to_user?.name}
              </p>
              <button
                onClick={() => handleDeleteShoutout(s.id)}
                className="text-red-600 text-sm font-semibold"
              >
                Delete Shoutout
              </button>
            </div>

            <p className="mb-2">{s.message}</p>

            {s.comments?.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2">Comments</p>
                {s.comments.map((c) => (
                  <div key={c.id} className="flex justify-between mb-2">
                    <span>
                      <b>{c.user?.name}:</b> {c.content}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(c.id, s.id)}
                      className="text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminModeration;
