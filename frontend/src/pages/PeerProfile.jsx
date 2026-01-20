import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllUsers } from "../services/api";

function PeerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [peer, setPeer] = useState(null);

  useEffect(() => {
    const loadPeer = async () => {
      const res = await getAllUsers(token);
      const found = res.data.find(u => u.id === Number(id));
      setPeer(found);
    };
    loadPeer();
  }, [id, token]);

  if (!peer) {
    return <p className="p-10 text-gray-400">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-10">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-600 font-medium"
        >
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
            {peer.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold">{peer.name}</h2>
            <p className="text-gray-500">{peer.department}</p>
            <p className="text-gray-400">{peer.email}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PeerProfile;
