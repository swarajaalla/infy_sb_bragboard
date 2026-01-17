import { useEffect, useState } from "react";
import { getReports, resolveReport } from "../../api/reports";
import axiosClient from "../../api/axiosClient";
import { formatDateTime } from "../../utils/date";


export default function ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
  setLoading(true);
  try {
    const [reportsRes, shoutoutsRes] = await Promise.all([
      getReports(),
      axiosClient.get("/api/shoutouts"),
    ]);

    setReports(reportsRes.data.filter((r) => !r.resolved));
    setShoutouts(shoutoutsRes.data);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (reportId) => {
    await resolveReport(reportId);
    loadReports();
  };

  const handleDelete = async (shoutoutId) => {
    if (!confirm("Delete this shout-out permanently?")) return;
    await axiosClient.delete(`/api/shoutouts/${shoutoutId}`);
    loadReports();
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading reports…</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow border p-4 space-y-4">
      <h2 className="text-lg font-semibold">🚩 Reported Shout-outs</h2>

      {reports.length === 0 && (
        <p className="text-sm text-gray-400">
          No reported shout-outs
        </p>
      )}

      {reports.map((r) => {
  const shoutout = shoutouts.find(
    (s) => s.id === r.shoutout_id
  );

  return (
    <div
      key={r.id}
      className="border rounded-lg p-4 space-y-3 bg-red-50"
    >
      {/* Shoutout content */}
      {shoutout ? (
        <div className="bg-white border rounded p-3">
          <p className="text-sm text-gray-800">
            {shoutout.message}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            From {shoutout.sender?.name} •{" "}
            {formatDateTime(shoutout.created_at)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          Shoutout not found (may be deleted)
        </p>
      )}

      <p className="text-sm">
        <span className="font-semibold">Reason:</span>{" "}
        {r.reason}
      </p>

      <p className="text-xs text-gray-600">
        Reported by {r.reported_by.name}
      </p>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => handleResolve(r.id)}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded"
        >
          Resolve
        </button>

        <button
          onClick={() => handleDelete(r.shoutout_id)}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
        >
          Delete Shout-out
        </button>
      </div>
    </div>
  );
})}

    </div>
  );
}
