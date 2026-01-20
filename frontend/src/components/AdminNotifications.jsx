import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRef } from "react";
import { getAdminNotifications } from "../services/api";



function AdminNotifications({ setBadge }) {
  const navigate = useNavigate();

  const prevCountRef = useRef(0);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
  if (!token) return;

  const fetchNotifications = async () => {
    try {
      const res = await getAdminNotifications(token);
      const data = res.data;

      const dynamicNotifications = [];

      // 🔴 ACTION: Pending shoutouts
      if (data.pending_reports > 0) {
        dynamicNotifications.push({
          id: "pending",
          type: "action",
          title: "Shoutouts pending moderation",
          message: `${data.pending_reports} shoutouts require your approval`,
          unread: true,
          action: "moderation"
        });
      }

      // 🟠 WARNING: Activity spike
      if (data.recent_reactions > 50) {
        dynamicNotifications.push({
          id: "activity",
          type: "warning",
          title: "Unusual activity detected",
          message: "High number of reactions in the last hour",
          unread: true
        });
      }

      // 🔵 INFO (optional, static but valid)
      dynamicNotifications.push({
        id: "weekly",
        type: "info",
        title: "Weekly report ready",
        message: "Your analytics summary is available",
        unread: false,
        action: "analytics"
      });

      setNotifications(dynamicNotifications);
    } catch (err) {
      console.error("Failed to fetch admin notifications", err);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 5000); // ⏱ polling

  return () => clearInterval(interval);
}, [token]);


  useEffect(() => {
    const unreadCount = notifications.filter(n => n.unread).length;

    if (unreadCount > prevCountRef.current) {
      toast.success("🔔 New admin notification received");
    }

    prevCountRef.current = unreadCount;
    setBadge(unreadCount);
  }, [notifications, setBadge]);



  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      )
    );
  };

  const handleAction = (notification) => {
    markAsRead(notification.id);

    if (notification.action === "moderation") {
      navigate("/admin/moderation");
    }

    if (notification.action === "analytics") {
      // switch tab instead of route
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-6">
        🔔 Notifications
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-5 rounded-xl border bg-white cursor-pointer
              ${n.unread
                ? "border-indigo-500 shadow-md"
                : "border-gray-200 opacity-80"}
            `}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">
                {n.title}
              </h4>
              <Badge type={n.type} />
            </div>

            <p className="text-gray-600 mb-4">
              {n.message}
            </p>

            {n.type === "action" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(n);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Review Now
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {notifications.length === 0 && (
        <p className="text-gray-500 mt-10">
          🎉 No new notifications
        </p>
      )}
    </div>
  );
}

/* ===== BADGE ===== */
function Badge({ type }) {
  const styles = {
    info: "bg-blue-100 text-blue-700",
    warning: "bg-orange-100 text-orange-700",
    action: "bg-red-100 text-red-700"
  };

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[type]}`}
    >
      {type.toUpperCase()}
    </span>
  );
}

export default AdminNotifications;
