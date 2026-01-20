import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";



function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // await registerUser(name, email, password, department);
        await registerUser(name, email, password, department);
        alert("Account created successfully 🎉");
        navigate("/login"); // go to login after signup
        } catch (err) {
            console.error("Registration error:", err.response?.data || err);
            alert(
              err.response?.data?.detail ||
              "Registration failed"
            );
          }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-10">

        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-400 mb-8">
          Join BragBoard today
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Department
            </label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Submit */}
        <button
            type="submit"
            disabled={!name || !email || !password || !department}
            className="w-full bg-indigo-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
         Create Account
        </button>

        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign in
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;
