import { useEffect, useState } from "react";
import { getAdminEmployees } from "../../api/adminEmployees";
import { formatDateTime } from "../../utils/date";

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminEmployees();
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load employees", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading employees…</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow border p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">
        👥 Employees
      </h2>

      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Joined</th>
            <th className="border p-2">Contributions</th>
            <th className="border p-2">Reports Made</th>
            <th className="border p-2">Reports On Him</th>
            <th className="border p-2">Most Appreciated</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">
                {formatDateTime(u.joined_at)}
              </td>
              <td className="border p-2 text-center">
                {u.contributions}
              </td>
              <td className="border p-2 text-center">
                {u.reports_made}
              </td>
              <td className="border p-2 text-center">
                {u.reports_on_him}
              </td>
              <td className="border p-2 text-center">
                {u.most_appreciated}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
