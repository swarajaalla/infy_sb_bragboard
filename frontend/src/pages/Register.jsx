// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "employee",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axiosClient.post("/api/users/register", form);
      // redirect to login after successful registration
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleRegister} className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Account</h1>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange}
          className="border w-full p-2 rounded mb-3" required />

        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
          className="border w-full p-2 rounded mb-3" required />

        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange}
          className="border w-full p-2 rounded mb-3" required />

        <input name="department" placeholder="Department (e.g. Engineering)" value={form.department}
          onChange={handleChange} className="border w-full p-2 rounded mb-3" required />

        <select name="role" value={form.role} onChange={handleChange} className="border w-full p-2 rounded mb-3">
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <button className="bg-blue-600 text-white w-full py-2 rounded mt-2">Register</button>
      </form>
    </div>
  );
}
