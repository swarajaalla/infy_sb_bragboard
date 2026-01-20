import { Routes, Route } from "react-router-dom";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import Dashboard from "../Pages/Dashboard";
import AdminDashboard from "../Pages/AdminDashboard";
import Profile from "../Pages/Profile";
import UserProfile from "../Pages/UserProfile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/user-profile/:userId" element={<UserProfile />} />
    </Routes>
  );
}
