import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow p-4 flex justify-between">
      <h1 className="font-bold text-xl">BragBoard</h1>

      <button
        onClick={handleLogout}
        className="text-red-500 font-semibold"
      >
        Logout
      </button>
    </nav>
  );
}
