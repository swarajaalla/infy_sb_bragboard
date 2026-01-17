import axiosClient from "./axiosClient";

// Employee: report a shoutout
export function reportShoutout(shoutoutId, reason) {
  return axiosClient.post("/api/reports", {
    shoutout_id: shoutoutId,
    reason,
  });
}

// Admin: get all reports
export function getReports() {
  return axiosClient.get("/api/reports");
}

// Admin: resolve a report
export function resolveReport(reportId) {
  return axiosClient.patch(`/api/reports/${reportId}/resolve`);
}
