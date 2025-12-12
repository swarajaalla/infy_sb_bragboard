// src/components/Sidebar.jsx
import { useState } from "react";

function Avatar({ name }) {
  const initials = name.split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase();
  return (
    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
      {initials}
    </div>
  );
}

export default function Sidebar({ data, isAdmin }) {
  // data: if admin -> { grouped: { dept: [users...] } }
  // if employee -> { peers: [...] }
  const [expanded, setExpanded] = useState(null);

  if (isAdmin) {
    const grouped = data.grouped || {};
    return (
      <aside className="w-80 p-4 bg-gray-50 border-r border-gray-200 min-h-screen">
        <h3 className="text-lg font-semibold mb-4">Departments</h3>
        <div className="space-y-3">
          {Object.entries(grouped).map(([dept, users]) => (
            <div key={dept} className="bg-white rounded-xl shadow-sm border p-3">
              <button
                onClick={() => setExpanded(expanded === dept ? null : dept)}
                className="w-full flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium">{dept}</div>
                  <div className="text-xs text-gray-500">{users.length} users</div>
                </div>
                <div className="text-sm text-gray-400">
                  {expanded === dept ? "▾" : "▸"}
                </div>
              </button>

              {expanded === dept && (
                <div className="mt-3 space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                      <Avatar name={u.name} />
                      <div>
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email} • {u.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    );
  } else {
    const peers = data.peers || [];
    return (
      <aside className="w-80 p-4 bg-gray-50 border-r border-gray-200 min-h-screen">
        <h3 className="text-lg font-semibold mb-4">Department peers</h3>
        <div className="space-y-2">
          {peers.length === 0 && <div className="text-sm text-gray-500">No peers found</div>}
          {peers.map(u => (
            <div key={u.id} className="bg-white p-3 rounded-lg shadow-sm flex gap-3 items-center hover:bg-gray-50">
              <Avatar name={u.name} />
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.email} • {u.role}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }
}
