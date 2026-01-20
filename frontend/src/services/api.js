import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});


// ---------------- REGISTER ----------------
export const registerUser = (name, email, password, department) =>
  api.post("/users/register", {
    name: name,
    email: email,
    password: password,
    department: department,
  });


// ---------------- LOGIN ----------------
export const loginUser = (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  return api.post("/users/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

// ---------------- CURRENT USER ----------------
export const getCurrentUser = (token) =>
  api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ---------------- SHOUTOUT FEED ----------------
export const getShoutoutFeed = (token, department) =>
  api.get(
    department ? `/shoutouts/feed?department=${department}` : "/shoutouts/feed",
    { headers: { Authorization: `Bearer ${token}` } }
  );


// ----------------- RECEIVED SHOUTOUTS ----------------
  export const getReceivedShoutouts = (token) =>
  api.get("/shoutouts/received", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


// ---------------- CREATE SHOUTOUT ----------------
export const createShoutout = (token, data) =>
  api.post("/shoutouts/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ----------------- SENT SHOUTOUTS ----------------
export const getSentShoutouts = (token) =>
  api.get("/shoutouts/sent", {
    headers: { Authorization: `Bearer ${token}` },
  });


// ---------------- GET ALL USERS ----------------
export const getAllUsers = (token) =>
  api.get("/users/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ---------------- SHOUTOUT FEED BY DEPARTMENT ----------------
  export const getShoutoutFeedByDepartment = (token, department) =>
  api.get(
    department === "all"
      ? "/shoutouts/feed"
      : `/shoutouts/feed?department=${department}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// ---------------- REACTIONS ----------------
export const addReaction = (token, data) =>
  api.post("/reactions/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default api;

// ---------------- COMMENTS ----------------

// List comments for a shoutout
export const getComments = (token, shoutoutId) =>
  api.get(`/comments?shoutout_id=${shoutoutId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Create comment
export const addComment = (token, data) =>
  api.post("/comments/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Delete comment
export const deleteComment = (token, commentId) =>
  api.delete(`/comments/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


// ---------------- USER STATS ----------------
export const getUserStats = (token) =>
  api.get("/users/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });



export const getMyShoutouts = (token) =>
  api.get("/shoutouts/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });



  // ---------------- ADMIN STATS ----------------
export const getAdminStats = (token) =>
  api.get("/admin/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  // ---------------- ADMIN MODERATION ----------------

export const getAllShoutoutsAdmin = (token) =>
  api.get("/admin/shoutouts", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminDeleteShoutout = (token, shoutoutId) =>
  api.delete(`/admin/shoutouts/${shoutoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminDeleteComment = (token, commentId) =>
  api.delete(`/admin/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });


// ---------------- REPORT SHOUTOUT ----------------
export const reportShoutout = (token, shoutoutId, reason) =>
  api.post(
    `/shoutouts/${shoutoutId}/report`,
    null,
    {
      params: { reason },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


// ---------------- ADMIN REPORTS ----------------

export const getReportedShoutouts = (token) =>
  api.get("/admin/reported-shoutouts", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const resolveReport = (token, id) =>
  api.post(`/admin/reports/${id}/resolve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });


// ---------------- ADMIN LOGS ----------------

export const getAdminLogs = (token) =>
  api.get("/admin/logs", {
    headers: { Authorization: `Bearer ${token}` },
  });


  // ---------------- ADMIN ANALYTICS ----------------

// Top Contributors
export const getTopContributors = (token) =>
  api.get("/admin/top-contributors", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Most Tagged Users
export const getMostTaggedUsers = (token) =>
  api.get("/admin/most-tagged", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


// ANALYTICS 
export const getDepartmentActivity = (token) =>
  api.get("/admin/department-activity", {
    headers: { Authorization: `Bearer ${token}` },
  });


  export const getAdminNotifications = (token) =>
  api.get("/admin/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });


  // ---------------- ADMIN EXPORT ----------------
export const exportMasterReport = (token, format) =>
  api.get(`/admin/export/master-report?format=${format}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob", // 🔥 IMPORTANT
  });

  // ---------------- ADMIN USER MANAGEMENT ----------------

// Get all users (admin)
export const adminGetUsers = (token) =>
  api.get("/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Create user (admin)
export const adminCreateUser = (token, data) =>
  api.post("/admin/users", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Delete user (admin)
export const adminDeleteUser = (token, userId) =>
  api.delete(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });



  // ---------------- DEPARTMENT RANK ----------------
export const getDepartmentRank = (token) =>
  api.get("/users/me/department-rank", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
