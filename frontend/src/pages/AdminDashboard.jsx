// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";

import ShoutoutComposer from "../components/dashboard/ShoutoutComposer";
import ShoutoutFeed from "../components/dashboard/ShoutoutFeed";

import DepartmentTree from "../components/admin/DepartmentTree";
import EmployeeInspector from "../components/admin/EmployeeInspector";
import ReportsPanel from "../components/admin/ReportsPanel";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [groupedUsers, setGroupedUsers] = useState({});
  const [shoutouts, setShoutouts] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await axiosClient.get("/api/users/me");
      setUser(me.data);

      const users = await axiosClient.get("/api/users");
      setAllUsers(users.data);

      const peers = await axiosClient.get("/api/users/department-peers");
      setGroupedUsers(peers.data.grouped || {});

      const feed = await axiosClient.get("/api/shoutouts");
      setShoutouts(feed.data);

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* LEFT — Departments */}
        <aside className="w-72 bg-white border-r overflow-y-auto">
          <DepartmentTree
            groupedUsers={groupedUsers}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployee}
          />
        </aside>

        {/* CENTER — Admin Workspace */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* 🚩 Reports Panel */}
          <ReportsPanel />

          {/* Shoutout Composer */}
          <ShoutoutComposer
            allUsers={allUsers}
            onPosted={async () => {
              const res = await axiosClient.get("/api/shoutouts");
              setShoutouts(res.data);
            }}
          />

          {/* Shoutout Feed */}
          <ShoutoutFeed
            shoutouts={shoutouts}
            currentUser={user}
          />
        </main>

        {/* RIGHT — Employee Inspector */}
        <aside className="w-[360px] bg-gray-50 border-l p-4 overflow-y-auto">
          <EmployeeInspector employee={selectedEmployee} />
        </aside>
      </div>
    </div>
  );
}
