// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getAdminStats, getCurrentUser } from "../services/api";
// import {
//   getTopContributors,
//   getMostTaggedUsers
// } from "../services/api";
// import AdminAnalytics from "../components/AdminAnalytics";


// import AdminActivity from "../components/AdminActivity";
// import StatCard from "../components/StatCard";

// function AdminDashboard() {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [topContributors, setTopContributors] = useState([]);
//   const [mostTagged, setMostTagged] = useState([]);
//   const [activeTab, setActiveTab] = useState("analytics");


//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     const init = async () => {
//       try {
//         const userRes = await getCurrentUser(token);

//         if (userRes.data.role !== "admin") {
//           navigate("/dashboard");
//           return;
//         }

//         // ✅ Admin analytics
//         const statsRes = await getAdminStats(token);
//         setStats(statsRes.data);

//         const topRes = await getTopContributors(token);
//         setTopContributors(topRes.data);

//         const taggedRes = await getMostTaggedUsers(token);
//         setMostTagged(taggedRes.data);

//       } catch (err) {
//         navigate("/dashboard");
//       }
//     };

//     init();
//   }, [token, navigate]);

//   if (!stats) return <p className="p-10">Loading admin stats...</p>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">
//       <h2 className="text-4xl font-bold mb-10 text-indigo-700">
//         🛡 Admin Dashboard
//       </h2>

//       <button
//         onClick={() => navigate("/admin/moderation")}
//         className="mb-10 px-6 py-3 bg-indigo-600 text-white rounded-xl"
//       >
//         Moderate Shoutouts
//       </button>

//       {/* ✅ STAT CARDS */}
//       <h3 className="text-xl font-semibold text-gray-700 mb-4">
//         Platform Overview
//       </h3>


//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <StatCard
//           label="Total Users"
//           value={stats.total_users}
//           icon="👥"
//           color="blue"
//         />
//         <StatCard
//           label="Shoutouts"
//           value={stats.total_shoutouts}
//           icon="📣"
//           color="purple"
//         />
//         <StatCard
//           label="Reactions"
//           value={stats.total_reactions}
//           icon="👍"
//           color="green"
//         />
//         <StatCard
//           label="Comments"
//           value={stats.total_comments}
//           icon="💬"
//           color="orange"
//         />
//       </div>

//       <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">
//         🏆 Top Contributors
//       </h3>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {topContributors.map((user, index) => (
//           <div
//             key={index}
//             className="p-5 bg-white rounded-xl shadow border"
//           >
//             <p className="font-semibold text-indigo-700">
//               {user.name}
//             </p>
//             <p>Shoutouts given: <b>{user.count}</b></p>

//           </div>
//         ))}
//       </div>

//       <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">
//         📌 Most Tagged Users
//       </h3>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {mostTagged.map((user, index) => (
//           <div
//             key={index}
//             className="p-5 bg-white rounded-xl shadow border"
//           >
//             <p className="font-semibold text-pink-700">
//               {user.name}
//             </p>
//             <p>Times tagged: <b>{user.count}</b></p>

//           </div>
//         ))}
//       </div>


//       <AdminAnalytics />

//       {/* ✅ Admin Activity */}
//       <AdminActivity />


//     </div>
//   );
// }

// export default AdminDashboard;


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   getAdminStats,
//   getCurrentUser,
//   getTopContributors,
//   getMostTaggedUsers,
// } from "../services/api";

// import StatCard from "../components/StatCard";
// import AdminAnalytics from "../components/AdminAnalytics";
// import AdminActivity from "../components/AdminActivity";

// function AdminDashboard() {
//   const navigate = useNavigate();

//   const [stats, setStats] = useState(null);
//   const [topContributors, setTopContributors] = useState([]);
//   const [mostTagged, setMostTagged] = useState([]);
//   const [activeTab, setActiveTab] = useState("analytics");

//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     const init = async () => {
//       try {
//         const userRes = await getCurrentUser(token);

//         if (userRes.data.role !== "admin") {
//           navigate("/dashboard");
//           return;
//         }

//         const statsRes = await getAdminStats(token);
//         setStats(statsRes.data);

//         const topRes = await getTopContributors(token);
//         setTopContributors(topRes.data);

//         const taggedRes = await getMostTaggedUsers(token);
//         setMostTagged(taggedRes.data);
//       } catch (err) {
//         navigate("/dashboard");
//       }
//     };

//     init();
//   }, [token, navigate]);

//   if (!stats) {
//     return <p className="p-10">Loading admin dashboard...</p>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">
//       {/* HEADER */}
//       <h2 className="text-4xl font-bold mb-6 text-indigo-700">
//         🛡 Admin Dashboard
//       </h2>

//       <button
//         onClick={() => navigate("/admin/moderation")}
//         className="mb-8 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow"
//       >
//         Moderate Shoutouts
//       </button>

//       {/* TABS */}
//       <div className="flex gap-4 mb-10">
//         <button
//           onClick={() => setActiveTab("analytics")}
//           className={`px-6 py-2 rounded-xl font-medium transition ${
//             activeTab === "analytics"
//               ? "bg-indigo-600 text-white shadow"
//               : "bg-white border text-gray-600"
//           }`}
//         >
//           📊 Analytics
//         </button>

//         <button
//           onClick={() => setActiveTab("logs")}
//           className={`px-6 py-2 rounded-xl font-medium transition ${
//             activeTab === "logs"
//               ? "bg-indigo-600 text-white shadow"
//               : "bg-white border text-gray-600"
//           }`}
//         >
//           🧾 Activity Logs
//         </button>
//       </div>

//       {/* ================= ANALYTICS TAB ================= */}
//       {activeTab === "analytics" && (
//         <>
//           {/* PLATFORM OVERVIEW */}
//           <h3 className="text-xl font-semibold text-gray-700 mb-4">
//             Platform Overview
//           </h3>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <StatCard label="Total Users" value={stats.total_users} icon="👥" color="blue" />
//             <StatCard label="Shoutouts" value={stats.total_shoutouts} icon="📣" color="purple" />
//             <StatCard label="Reactions" value={stats.total_reactions} icon="👍" color="green" />
//             <StatCard label="Comments" value={stats.total_comments} icon="💬" color="orange" />
//           </div>

//           {/* TOP CONTRIBUTORS */}
//           <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">
//             🏆 Top Contributors
//           </h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {topContributors.map((user, index) => (
//               <div
//                 key={index}
//                 className="p-5 bg-white rounded-xl shadow border"
//               >
//                 <p className="font-semibold text-indigo-700">{user.name}</p>
//                 <p>
//                   Shoutouts given: <b>{user.count}</b>
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* MOST TAGGED USERS */}
//           <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">
//             📌 Most Tagged Users
//           </h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {mostTagged.map((user, index) => (
//               <div
//                 key={index}
//                 className="p-5 bg-white rounded-xl shadow border"
//               >
//                 <p className="font-semibold text-pink-700">{user.name}</p>
//                 <p>
//                   Times tagged: <b>{user.count}</b>
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* ANALYTICS CHARTS */}
//           <AdminAnalytics />
//         </>
//       )}

//       {/* ================= LOGS TAB ================= */}
//       {activeTab === "logs" && <AdminActivity />}
//     </div>
//   );
// }

// export default AdminDashboard;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  getAdminStats,
  getCurrentUser,
  getTopContributors,
  getMostTaggedUsers
} from "../services/api";

import StatCard from "../components/StatCard";
import AdminActivity from "../components/AdminActivity";
import AdminAnalytics from "../components/AdminAnalytics";
import AdminNotifications from "../components/AdminNotifications";
import AdminSettings from "../components/AdminSettings";
import AdminProfile from "../components/AdminProfile";
import AdminUsers from "../components/AdminUsers";



function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [mostTagged, setMostTagged] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics");
  const [currentUser, setCurrentUser] = useState(null);

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const init = async () => {
      try {
        const userRes = await getCurrentUser(token);
        if (userRes.data.role !== "admin") {
          navigate("/dashboard");
          return;
        }

        setCurrentUser(userRes.data);

        const statsRes = await getAdminStats(token);
        setStats(statsRes.data);

        const topRes = await getTopContributors(token);
        setTopContributors(topRes.data);

        const taggedRes = await getMostTaggedUsers(token);
        setMostTagged(taggedRes.data);

      } catch {
        navigate("/dashboard");
      }
    };

    init();
  }, [token, navigate]);

  if (!stats) return <p className="p-10">Loading admin dashboard...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        {/* LEFT: Title */}
        <h2 className="text-4xl font-bold text-indigo-700 flex items-center gap-3">
          🛡 Admin Dashboard
        </h2>

        {/* RIGHT: Tabs */}
        <div className="flex gap-2">
          <TabButton active={activeTab==="analytics"} onClick={()=>setActiveTab("analytics")} icon="📊" label="Analytics" />
          <TabButton active={activeTab==="logs"} onClick={()=>setActiveTab("logs")} icon="📜" label="Logs" />
          <TabButton
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon="🔔"
            label="Notifications"
            badge={notificationCount}
          />
          <TabButton
            active={activeTab==="users"}
            onClick={()=>setActiveTab("users")}
            icon="👥"
            label="Users"
          />

          <TabButton active={activeTab==="settings"} onClick={()=>setActiveTab("settings")} icon="⚙️" label="Settings" />
          <TabButton active={activeTab==="profile"} onClick={()=>setActiveTab("profile")} icon="👤" label="Profile" />
        </div>

      </div>


      <button
        onClick={() => navigate("/admin/moderation")}
        className="mb-10 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
      >
        Moderate Shoutouts
      </button>


      
      {/* ===== ANIMATED TAB CONTENT ===== */}
      <AnimatePresence mode="wait">
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            {/* PLATFORM OVERVIEW */}
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Platform Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total Users" value={stats.total_users} icon="👥" color="blue" />
              <StatCard label="Shoutouts" value={stats.total_shoutouts} icon="📣" color="purple" />
              <StatCard label="Reactions" value={stats.total_reactions} icon="👍" color="green" />
              <StatCard label="Comments" value={stats.total_comments} icon="💬" color="orange" />
            </div>

            {/* TOP CONTRIBUTORS */}
            <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">
              🏆 Top Contributors
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topContributors.map((u, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow">
                  <p className="font-semibold text-indigo-700">{u.name}</p>
                  <p>Shoutouts given: <b>{u.count}</b></p>
                </div>
              ))}
            </div>

            {/* MOST TAGGED */}
            <h3 className="text-xl font-semibold text-gray-700 mt-12 mb-4">
              📌 Most Tagged Users
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mostTagged.map((u, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow">
                  <p className="font-semibold text-pink-700">{u.name}</p>
                  <p>Times tagged: <b>{u.count}</b></p>
                </div>
              ))}
            </div>

            {/* CHARTS */}
            <AdminAnalytics />
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <AdminActivity />
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <AdminNotifications setBadge={setNotificationCount} />
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            {currentUser && (
              <AdminUsers
                token={token}
                currentUserId={currentUser.id}
              />
            )}
          </motion.div>
        )}


        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
          <AdminSettings />
          </motion.div>
        )}



          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <AdminProfile />
            </motion.div>
          )}

      </AnimatePresence>
    </div>
  );
}

/* ===== TAB BUTTON COMPONENT ===== */
function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition
        ${active
          ? "bg-indigo-600 text-white shadow-lg"
          : "bg-white text-gray-600 hover:bg-gray-100 border"
        }`}
    >
      <span>{icon}</span>
      {label}

      {/* 🔴 BADGE */}
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}


export default AdminDashboard;
