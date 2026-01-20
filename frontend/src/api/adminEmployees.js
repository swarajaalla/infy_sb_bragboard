import axiosClient from "./axiosClient";

// ✅ Get all employees (admin)
export const getAdminEmployees = () => {
  return axiosClient.get("/api/admin/employees");
};

// ✅ Delete employee by ID (admin)
export const deleteEmployee = (id) => {
  return axiosClient.delete(`/api/admin/employees/${id}`);
};
