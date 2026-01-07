import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function CreateShoutOut({ onSuccess }) {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await api.get(`/shoutouts/users/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const addRecipient = (user) => {
    if (!recipients.find((r) => r.id === user.id)) {
      setRecipients([...recipients, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const removeRecipient = (userId) => {
    setRecipients(recipients.filter((r) => r.id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Message cannot be empty");
      return;
    }

    if (recipients.length === 0) {
      setError("Please tag at least one recipient");
      return;
    }

    setLoading(true);

    try {
      await api.post("/shoutouts/", {
        message: message.trim(),
        recipient_ids: recipients.map((r) => r.id),
      });

      setMessage("");
      setRecipients([]);
      setError("");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create shout-out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Send a Shout-Out! 🎉</h2>

      <form onSubmit={handleSubmit}>
        {/* Message Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your shout-out message here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="5"
          />
        </div>

        {/* Recipient Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag Recipients
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for users to tag..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => addRecipient(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 flex justify-between items-center border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{result.name}</p>
                      <p className="text-sm text-gray-600">{result.department}</p>
                    </div>
                    <span className="text-blue-500">+</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Recipients */}
        {recipients.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagged Recipients ({recipients.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="bg-blue-100 border border-blue-300 rounded-full px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-sm font-medium text-blue-800">{recipient.name}</span>
                  <button
                    type="button"
                    onClick={() => removeRecipient(recipient.id)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200"
        >
          {loading ? "Posting..." : "Post Shout-Out"}
        </button>
      </form>
    </div>
  );
}
