import axiosClient from "./axiosClient";

export function getAdminEmployees() {
  return axiosClient.get("/api/admin/employees");
}
