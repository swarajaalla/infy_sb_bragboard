import { useEffect, useState } from "react";
import {
  adminGetUsers,
  adminCreateUser,
  adminDeleteUser,
} from "../services/api";

const AdminUsers = ({ token, currentUserId }) => {
  const [users, setUsers] = useState([]);
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
      role: "user",
    });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete user?")) return;
    await adminDeleteUser(token, id);
    fetchUsers();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-4">👥 User Management</h3>

      {/* CREATE USER */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <input placeholder="Name" value={form.name}
          onChange={(e)=>setForm({...form, name:e.target.value})} />
        <input placeholder="Email" value={form.email}
          onChange={(e)=>setForm({...form, email:e.target.value})} />
        <input placeholder="Department" value={form.department}
          onChange={(e)=>setForm({...form, department:e.target.value})} />
        <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e)=>setForm({...form, password:e.target.value})}
        />

        <select
        value={form.role}
        onChange={(e)=>setForm({...form, role:e.target.value})}
        className="border rounded px-2"
        >
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
        </select>

        <button onClick={handleCreate}
          className="bg-indigo-600 text-white rounded">
          Add
        </button>
      </div>

      {/* USERS TABLE */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Dept</th>
            <th>Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.department}</td>
              <td>{u.role}</td>
              <td>
                {u.role !== "admin" && u.id !== currentUserId && (
                    <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:underline"
                    >
                        Delete
                    </button>
                    )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
