// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import ShoutoutComposer from "../components/dashboard/ShoutoutComposer";
import ShoutoutFeed from "../components/dashboard/ShoutoutFeed";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [peersData, setPeersData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await axiosClient.get("/api/users/me");
        setUser(me.data);

        const peers = await axiosClient.get("/api/users/department-peers");
        setPeersData(peers.data);

        const users = await axiosClient.get("/api/users");
        setAllUsers(users.data);

        const feed = await axiosClient.get("/api/shoutouts");
        setShoutouts(feed.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <Navbar />
      <div className="flex">
        <Sidebar data={peersData || {}} isAdmin={user.role === "admin"} />

        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto">
          <ShoutoutComposer
            allUsers={allUsers}
            onPosted={() => {
              axiosClient.get("/api/shoutouts").then((res) => {
                setShoutouts(res.data);
              });
            }}
          />

          <ShoutoutFeed
            shoutouts={shoutouts}
            currentUser={user}
          />
        </main>
      </div>
    </div>
  );
}
