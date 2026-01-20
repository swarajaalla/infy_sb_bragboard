import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [sentShoutouts, setSentShoutouts] = useState([]);
  const [receivedShoutouts, setReceivedShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    sent_count: 0,
    received_count: 0,
    reaction_count: 0,
  });

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch all users and find the one we need
      const usersResponse = await api.get(`/shoutouts/users/all`);
      const user = usersResponse.data.find(u => u.id === parseInt(userId));
      if (!user) throw new Error("User not found");
      setProfile(user);

      // Fetch sent shoutouts
      const sentResponse = await api.get(`/shoutouts?sender_id=${userId}&limit=50`);
      setSentShoutouts(sentResponse.data || []);

      // Fetch received shoutouts
      const receivedResponse = await api.get(`/shoutouts?recipient_id=${userId}&limit=50`);
      setReceivedShoutouts(receivedResponse.data || []);

      // Calculate stats
      const sentCount = sentResponse.data?.length || 0;
      const receivedCount = receivedResponse.data?.length || 0;
      const reactionCount = receivedResponse.data?.reduce(
        (sum, shout) => sum + (shout.reactions?.length || 0),
        0
      ) || 0;

      setStats({
        sent_count: sentCount,
        received_count: receivedCount,
        reaction_count: reactionCount,
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Navbar user={currentUser} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Navbar user={currentUser} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg">{error || "User not found"}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Navbar user={currentUser} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-lg text-gray-600">{profile.department}</p>
              <p className="text-sm text-gray-500">ID: #{profile.id}</p>
            </div>
          </div>
          <p className="text-gray-700">{profile.email}</p>
        </div>

        {/* Stats Section - Instagram Style */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.sent_count}</p>
            <p className="text-gray-600 font-medium mt-2">Shout-Outs Sent</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.received_count}</p>
            <p className="text-gray-600 font-medium mt-2">Shout-Outs Received</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.reaction_count}</p>
            <p className="text-gray-600 font-medium mt-2">Total Reactions</p>
          </div>
        </div>

        {/* Shout-Outs Received */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Shout-Outs Received ({receivedShoutouts.length})
          </h2>
          {receivedShoutouts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No shout-outs received yet. Be the first to send one! 🎉
            </p>
          ) : (
            <div className="space-y-4">
              {receivedShoutouts.map((shoutout) => (
                <div key={shoutout.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {shoutout.sender?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{shoutout.sender?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(shoutout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-3">{shoutout.message}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>❤️ {shoutout.reactions?.filter(r => r.type === "heart").length || 0}</span>
                    <span>👍 {shoutout.reactions?.filter(r => r.type === "thumbs_up").length || 0}</span>
                    <span>👏 {shoutout.reactions?.filter(r => r.type === "clap").length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shout-Outs Sent */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Shout-Outs Sent ({sentShoutouts.length})
          </h2>
          {sentShoutouts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              This user hasn't sent any shout-outs yet.
            </p>
          ) : (
            <div className="space-y-4">
              {sentShoutouts.map((shoutout) => (
                <div key={shoutout.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Sent to:</p>
                    <div className="flex flex-wrap gap-2">
                      {shoutout.recipients?.map((recipient) => (
                        <span
                          key={recipient.id}
                          className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          @{recipient.recipient?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-800 mb-3">{shoutout.message}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>❤️ {shoutout.reactions?.filter(r => r.type === "heart").length || 0}</span>
                    <span>👍 {shoutout.reactions?.filter(r => r.type === "thumbs_up").length || 0}</span>
                    <span>👏 {shoutout.reactions?.filter(r => r.type === "clap").length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
