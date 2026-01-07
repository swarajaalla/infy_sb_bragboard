import { useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        // OAuth2PasswordRequestForm expects form-encoded fields: username & password
        const params = new URLSearchParams();
        params.append("username", form.email);
        params.append("password", form.password);
        const res = await api.post("/auth/login", params);
        
        // Store token in localStorage (both keys for compatibility)
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("token", res.data.access_token);
        
        // Update auth context
        if (res.data.user && login) {
          try {
            await login(form.email, form.password);
          } catch (contextErr) {
            console.log("Context login skipped, using direct token storage");
          }
        }
        
        setLoading(false);
        navigate("/dashboard");
      } else {
        await api.post("/auth/register", form);
        setLoading(false);
        setIsLogin(true);
        alert("Registered successfully. Please login.");
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.detail || err.message || "Backend not responding. Is the server running on http://localhost:8000?";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[300px]">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-white">
            <h1 className="text-3xl font-bold mb-2">BragBoard</h1>
            <p className="text-indigo-100">Share your achievements</p>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            <h2 className="text-xl font-bold text-gray-800 mb-8">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-3"
            >
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Name</label>
                    <input
                      name="name"
                      placeholder="Full Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Department</label>
                    <input
                      name="department"
                      placeholder="Your Department"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-1.5 rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="mt-8 text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setError("");
                    setIsLogin(!isLogin);
                  }}
                  className="text-indigo-600 font-bold hover:text-purple-600 transition"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6">
          Share your professional achievements with your team
        </p>
      </div>
    </div>
  );
}
