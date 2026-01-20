import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyDepartment from "./pages/MyDepartment";
import Profile from "./pages/Profile";
import AllDepartments from "./pages/AllDepartments";
import PeerProfile from "./pages/PeerProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminModeration from "./pages/AdminModeration";

function App() {
  return (
    <>
      {/* 🔔 GLOBAL TOASTER */}
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-department" element={<MyDepartment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/all-departments" element={<AllDepartments />} />
        <Route path="/peer/:id" element={<PeerProfile />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
      </Routes>
    </>
  );
}

export default App;
