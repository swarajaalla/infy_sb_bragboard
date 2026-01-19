import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/admin";

export default function AdminStats() {
  const [topContributors, setTopContributors] = useState([]);
  const [mostAppreciated, setMostAppreciated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminStats();
        const data = res.data || {};

        setTopContributors(
          Array.isArray(data.top_contributors)
            ? data.top_contributors
            : []
        );

        setMostAppreciated(
          Array.isArray(data.most_appreciated)
            ? data.most_appreciated
            : []
        );
      } catch (e) {
        console.error("Admin stats error:", e);
        setTopContributors([]);
        setMostAppreciated([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border p-4">
        <p className="text-sm text-gray-400">Loading analytics…</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 🏆 Top Contributors */}
      <div className="bg-white rounded-xl shadow border p-4">
        <h2 className="font-semibold text-lg mb-3">
          🏆 Top Contributors
        </h2>

        {topContributors.length === 0 ? (
          <p className="text-sm text-gray-400">No data available</p>
        ) : (
          <ul className="space-y-2">
            {topContributors.map((u, index) => (
              <li
                key={u.id}
                className="flex justify-between text-sm"
              >
                <span>{index + 1}. {u.name}</span>
                <span className="font-semibold">{u.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ❤️ Most Appreciated */}
      <div className="bg-white rounded-xl shadow border p-4">
        <h2 className="font-semibold text-lg mb-3">
          ❤️ Most Appreciated
        </h2>

        {mostAppreciated.length === 0 ? (
          <p className="text-sm text-gray-400">No data available</p>
        ) : (
          <ul className="space-y-2">
            {mostAppreciated.map((u, index) => (
              <li
                key={u.id}
                className="flex justify-between text-sm"
              >
                <span>{index + 1}. {u.name}</span>
                <span className="font-semibold">{u.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
