import { useEffect, useState } from "react";
import {
  adminGetUsers,
  adminCreateUser,
  adminDeleteUser,
  adminDisableUser,
  adminEnableUser
} from "../services/api";

const AdminUsers = ({ token, currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    role: "employee",
  });

  const fetchUsers = async () => {
    const res = await adminGetUsers(token);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }
    await adminCreateUser(token, form);
    setForm({
      name: "",
      email: "",
      department: "",
      password: "",
      role: "employee",
    });
    fetchUsers();
  };

  const handleDisable = async (id) => {
    if (!window.confirm("Disable this user?")) return;
    await adminDisableUser(token, id);
    fetchUsers();
  };

  const handleEnable = async (id) => {
    await adminEnableUser(token, id);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete user?")) return;
    await adminDeleteUser(token, id);
    fetchUsers();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-semibold mb-6">👥 User Management</h3>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name or ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 border rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* CREATE USER */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        <input className="border rounded-lg px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input className="border rounded-lg px-3 py-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input className="border rounded-lg px-3 py-2"
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border rounded-lg px-2"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
        >
          Add
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Dept</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(
                (u) =>
                  u.name.toLowerCase().includes(search.toLowerCase()) ||
                  u.id.toString().includes(search)
              )
              .map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.department}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>

                  {/* STATUS */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold
                        ${u.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"}`}
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3 min-w-[140px]">
                      {u.role !== "admin" && u.id !== currentUserId ? (
                        <>
                          {u.is_active ? (
                            <button
                              onClick={() => handleDisable(u.id)}
                              className="text-yellow-600 hover:underline"
                            >
                              Disable
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnable(u.id)}
                              className="text-green-600 hover:underline"
                            >
                              Enable
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {users.length > 0 &&
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.id.toString().includes(search)
        ).length === 0 && (
          <p className="text-gray-500 mt-4">No users found</p>
        )}
    </div>
  );
};

export default AdminUsers;
