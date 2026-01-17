// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1️⃣ Login
      const response = await axiosClient.post("/api/users/login", {
        email,
        password,
      });

      // 2️⃣ Store token
      localStorage.setItem("access_token", response.data.access_token);

      // 3️⃣ Get user details
      const me = await axiosClient.get("/api/users/me");

      // 4️⃣ Role-based redirect
      if (me.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 404 && detail === "Email not registered") {
        setError("Email not registered. Please register first.");
      } else {
        setError("Invalid email or password");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded p-6 w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login
        </h1>

        {error && (
          <p className="text-red-500 text-center text-sm mb-3">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded mt-2 hover:bg-blue-700 transition"
        >
          Login
        </button>

        <div className="text-center mt-3 text-sm">
          New user?{" "}
          <Link to="/register" className="text-blue-600 font-medium">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}
