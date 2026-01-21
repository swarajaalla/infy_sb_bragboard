import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { getDepartmentActivity } from "../services/api";

const COLORS = [
  "#6366F1", // Indigo
  "#22C55E", // Green
  "#F97316", // Orange
  "#EC4899", // Pink
  "#0EA5E9", // Sky Blue
];


export default function AdminAnalytics() {
  const [data, setData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    getDepartmentActivity(token).then((res) => {
      setData(res.data || []);
    });
  }, [token]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-10">
      <h3 className="text-xl font-semibold mb-6">
        📊 Most Active Departments
      </h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="department" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
