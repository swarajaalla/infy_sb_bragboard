import Navbar from "../components/Navbar";
import AdminEmployees from "../components/admin/AdminEmployees";

export default function AdminEmployeesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        <h1 className="text-2xl font-semibold">
          👥 Employee Management
        </h1>

        <AdminEmployees />
      </main>
    </div>
  );
}
