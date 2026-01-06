import { useState } from "react";
import { createShoutout } from "../../api/shoutouts";

export default function ShoutoutComposer({ allUsers, onPosted }) {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Group users by department
  const usersByDept = allUsers.reduce((acc, u) => {
    const dept = u.department || "Unknown";
    acc[dept] = acc[dept] || [];
    acc[dept].push(u);
    return acc;
  }, {});

  const toggleRecipient = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePost = async () => {
    if (!message || selectedRecipients.length === 0) return;

    setPosting(true);
    setError("");

    try {
      await createShoutout({
        message,
        recipient_ids: selectedRecipients,
      });

      setSelectedDept("");
      setSelectedRecipients([]);
      setMessage("");
      onPosted(); // refresh feed
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to post shout-out");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow border overflow-hidden">
      <div className="px-6 py-4 bg-indigo-600 text-white font-semibold">
        Create a Shout-out
      </div>

      <div className="p-6 space-y-4">
        {/* Department */}
        <select
          className="w-full p-2 border rounded-lg"
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setSelectedRecipients([]);
          }}
        >
          <option value="">Select Department</option>
          {Object.keys(usersByDept).map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Employees */}
        {selectedDept && (
          <div className="bg-indigo-50 p-3 rounded-lg max-h-40 overflow-y-auto">
            {usersByDept[selectedDept].map((u) => (
              <label key={u.id} className="block text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedRecipients.includes(u.id)}
                  onChange={() => toggleRecipient(u.id)}
                />
                {u.name}
              </label>
            ))}
          </div>
        )}

        {/* Message */}
        {selectedRecipients.length > 0 && (
          <>
            <textarea
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Write something meaningful..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button
              onClick={handlePost}
              disabled={posting}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
            >
              {posting ? "Posting..." : "Post Shout-out"}
            </button>
          </>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
