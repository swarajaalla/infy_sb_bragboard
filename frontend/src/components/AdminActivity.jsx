import { useEffect, useState } from "react";
import { getAdminLogs } from "../services/api";

const iconMap = {
  shoutout: "🗑️",
  comment: "💬",
  report: "🚨",
};

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchLogs = async () => {
      try {
        const res = await getAdminLogs(token);
        setLogs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch admin logs", err);
      }
    };

    fetchLogs(); // initial load

    const interval = setInterval(fetchLogs, 5000); // ⏱ refresh every 5 sec

    return () => clearInterval(interval); // cleanup
  }, [token]);


  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-10">
      <h3 className="text-xl font-semibold mb-6">
        Recent Admin Activity
      </h3>
      <p className="text-xs text-green-500 mb-4">
        ● Live updates every 5 seconds
      </p>


      {logs.length === 0 ? (
        <p className="text-gray-500">No admin actions yet.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex items-start gap-4 border-b pb-4"
            >
              <div className="text-2xl">
                {iconMap[log.target_type] || "⚙️"}
              </div>

              <div>
                <p className="font-medium text-gray-800">
                  {log.action} #{log.target_id}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
