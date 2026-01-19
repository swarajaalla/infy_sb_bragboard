import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/admin";
import { getLeaderboardStats } from "../../api/admin";
import { exportLeaderboardToCSV } from "../../utils/exportLeaderboardCSV";
import { exportLeaderboardToPDF } from "../../utils/exportLeaderboardPDF";


function Badge({ rank }) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function Leaderboard() {
  const [topContributors, setTopContributors] = useState([]);
  const [mostAppreciated, setMostAppreciated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLeaderboardStats();
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
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-gray-400">
        Loading leaderboard…
      </p>
    );
  }

  const card = (title, list, color) => (
    <div className="bg-white rounded-2xl shadow border p-5">
      <h2 className="font-semibold text-lg mb-4">{title}</h2>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400">No data available</p>
      ) : (
        <ul className="space-y-3">
          {list.map((u, i) => (
            <li
              key={u.id}
              className={`flex justify-between items-center p-2 rounded-lg ${
                i < 3 ? `${color} bg-opacity-10` : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  <Badge rank={i + 1} />
                </span>
                <span className="font-medium">{u.name}</span>
              </div>

              <span className="font-semibold">{u.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
  <>
    <div className="flex gap-3 mb-4">
  <button
    onClick={() =>
      exportLeaderboardToCSV(
        topContributors,
        mostAppreciated
      )
    }
    className="px-3 py-1 text-sm bg-gray-600 text-white rounded"
  >
    Export CSV
  </button>

  <button
    onClick={() =>
      exportLeaderboardToPDF(
        topContributors,
        mostAppreciated
      )
    }
    className="px-3 py-1 text-sm bg-gray-600 text-white rounded"
  >
    Export PDF
  </button>
</div>


    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {card("🏆 Top Contributors", topContributors, "bg-yellow-200")}
      {card("❤️ Most Appreciated", mostAppreciated, "bg-pink-200")}
    </div>
  </>
);

}
