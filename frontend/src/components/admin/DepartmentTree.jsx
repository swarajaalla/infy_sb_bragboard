// src/components/admin/DepartmentTree.jsx
export default function DepartmentTree({
  groupedUsers,
  selectedEmployee,
  onSelectEmployee,
}) {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Departments
      </h2>

      {Object.keys(groupedUsers).length === 0 && (
        <p className="text-sm text-gray-400">
          No departments found
        </p>
      )}

      {Object.entries(groupedUsers).map(([dept, users]) => (
        <div key={dept} className="space-y-2">
          {/* Department name */}
          <p className="text-sm font-semibold text-indigo-600">
            {dept}
          </p>

          {/* Employees */}
          <ul className="ml-2 space-y-1">
            {users.map((u) => {
              const active = selectedEmployee?.id === u.id;

              return (
                <li
                  key={u.id}
                  onClick={() => onSelectEmployee(u)}
                  className={`cursor-pointer rounded px-2 py-1 text-sm transition
                    ${
                      active
                        ? "bg-indigo-100 text-indigo-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {u.name}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
