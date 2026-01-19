// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LeaderboardPage from "./pages/Leaderboard";
import AdminEmployeesPage from "./pages/AdminEmployeesPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Employee Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />



        {/* Fallback */}
        <Route path="*" element={<Login />} />

        <Route path="/leaderboard" element={<LeaderboardPage />} />

        <Route
  path="/admin/employees"
  element={<AdminEmployeesPage />}
/>

      </Routes>
    </BrowserRouter>
       
        
  );
}
