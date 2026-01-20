import { useNavigate } from "react-router-dom";

export default function AdminProfile() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">👤 Admin Profile</h3>

      <p className="mb-4"><b>Role:</b> Administrator</p>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
        className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
