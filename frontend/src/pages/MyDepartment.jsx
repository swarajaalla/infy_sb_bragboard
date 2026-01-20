import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getAllUsers } from "../services/api";

function MyDepartment() {
  const [user, setUser] = useState(null);
  const [peers, setPeers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await getCurrentUser(token);
      const usersRes = await getAllUsers(token);

      const currentUser = userRes.data;

      const departmentPeers = usersRes.data.filter(
        (u) =>
          u.department === currentUser.department &&
          u.id !== currentUser.id
      );

      setUser(currentUser);
      setPeers(departmentPeers);
    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

  if (!user) {
    return <p className="p-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>


        {/* Page Title */}
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">
          👥 My Department
        </h1>

        {/* Department Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
            {user.department[0]}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user.department} Department
            </h2>
            <p className="text-gray-500">
              {peers.length + 1} Members
            </p>
          </div>
        </div>

        {/* Peers Section */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Team Members
        </h2>

        {peers.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            No other members in your department yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {peers.map((peer) => (
              <div
                key={peer.id}
                onClick={() => navigate(`/peer/${peer.id}`)}
                className="
                  bg-white p-6 rounded-xl shadow
                  cursor-pointer
                  hover:shadow-lg hover:-translate-y-1
                  transition
                "
              >


                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {peer.name.charAt(0).toUpperCase()}
                </div>


                <div>
                  <p className="font-semibold text-gray-800">
                    {peer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {peer.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyDepartment;
