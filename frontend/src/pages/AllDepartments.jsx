import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../services/api";

function AllDepartments() {
  const [departments, setDepartments] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getAllUsers(token);

      const deptMap = {};
      res.data.forEach((u) => {
        if (!deptMap[u.department]) {
          deptMap[u.department] = [];
        }
        deptMap[u.department].push(u);
      });

      setDepartments(deptMap);
    };

    fetchUsers();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>


        {/* Page Title */}
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">
          🏢 All Departments
        </h1>

        {Object.keys(departments).length === 0 ? (
          <p className="text-center text-gray-400 mt-20">
            No departments found
          </p>
        ) : (
          <div className="space-y-8">
            {Object.keys(departments).map((dept) => (
              <div
                key={dept}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                {/* Department Header */}
                <div className="flex items-center gap-4 mb-6">

                  <hr className="border-gray-200 mb-6" />

                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                    {dept.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {dept} Department
                    </h2>
                    <p className="text-sm text-gray-500">
                      {departments[dept].length} Members
                    </p>
                  </div>
                </div>

                {/* Members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments[dept].map((u) => (
                    <div
                      key={u.id}
                      onClick={() => navigate(`/peer/${u.id}`)}
                      className="
                        bg-indigo-50 rounded-xl p-4
                        flex items-center gap-4
                        hover:bg-indigo-100 hover:ring-2 hover:ring-indigo-300
                        cursor-pointer transition
                      "
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default AllDepartments;
