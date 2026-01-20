import axiosClient from "./axiosClient";

export function getAdminStats() {
  return axiosClient.get("/api/admin/stats");
}

export function getLeaderboardStats() {
  return axiosClient.get("/api/admin/leaderboard");
}

export const deleteEmployee = (id) =>
  axiosClient.delete(`/api/admin/employees/${id}`);
