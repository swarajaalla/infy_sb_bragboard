import { useEffect, useState } from "react";
import {
  getAdminEmployees,
  deleteEmployee,
} from "../../api/adminEmployees";
import { formatDateTime } from "../../utils/date";

import { exportEmployeesToCSV } from "../../utils/exportEmployeesCSV";
import { exportEmployeesToPDF } from "../../utils/exportEmployeesPDF";


export default function AdminEmployees() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [visibleEmployees, setVisibleEmployees] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminEmployees();
        const data = Array.isArray(res.data) ? res.data : [];
        setAllEmployees(data);
        setVisibleEmployees(data);
      } catch (e) {
        console.error("Failed to load employees", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
  if (searchId.trim() === "") {
    setVisibleEmployees(allEmployees);
  }
}, [searchId, allEmployees]);


  // 🔍 Search by ID
  const handleSearch = () => {
    if (!searchId.trim()) return;

    const id = Number(searchId);
    const found = allEmployees.filter((e) => e.id === id);
    setVisibleEmployees(found);
  };

  // 🔄 Reset table
  const handleReset = () => {
    setSearchId("");
    setVisibleEmployees(allEmployees);
  };

  // 🗑 Delete employee
  const handleDelete = async (id) => {
    if (!confirm("Delete this employee permanently?")) return;

    try {
      await deleteEmployee(id);
      const updated = allEmployees.filter((e) => e.id !== id);
      setAllEmployees(updated);
      setVisibleEmployees(updated);
    } catch (e) {
      alert("Failed to delete employee");
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading employees…</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow border p-4 space-y-4">
      <h2 className="text-lg font-semibold">
        👥 Employee Management
      </h2>

      {/* 🔍 Search Controls */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="Enter Employee ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-48"
        />

        <button
          onClick={handleSearch}
          className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
        >
          Search
        </button>

        <button
          onClick={handleReset}
          className="px-3 py-2 bg-gray-200 rounded text-sm"
        >
          Show All
        </button>
      </div>

      <div className="flex gap-3 mb-4">
  <button
    onClick={() => exportEmployeesToCSV(visibleEmployees)}
    className="px-4 py-2 bg-green-600 text-white rounded text-sm"
  >
    Export CSV
  </button>

  <button
    onClick={() => exportEmployeesToPDF(visibleEmployees)}
    className="px-4 py-2 bg-red-600 text-white rounded text-sm"
  >
    Export PDF
  </button>
</div>


      {/* 📋 Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Department</th> 
              <th className="border p-2">Joined</th>
              <th className="border p-2">Contributions</th>
              <th className="border p-2">Reports Made</th>
              <th className="border p-2">Reports On Him</th>
              <th className="border p-2">Most Appreciated</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center text-gray-400 p-4"
                >
                  No employees found
                </td>
              </tr>
            ) : (
              visibleEmployees.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border p-2">{u.id}</td>
                  <td className="border p-2">{u.name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">
                    {u.department || "—"}
                  </td>

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
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
