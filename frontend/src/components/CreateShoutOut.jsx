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
  const [attachments, setAttachments] = useState([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = [
    "😀", "😂", "❤️", "👍", "🔥", "👏", "😍", "🎉", "✨", "🙌",
    "😎", "💪", "👌", "🚀", "💯", "🎊", "👏", "💝", "🌟", "⭐",
    "😡", "😢", "😴", "😷", "🤔", "😎", "🤖", "👽", "🎭", "🎨"
  ];

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await api.get(`/shoutouts/users/search?query=${encodeURIComponent(query)}`);
      console.log("Search results:", response.data); // Debug log
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users");
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Strip @ symbol if present for searching
    const searchQuery = query.startsWith("@") ? query.substring(1) : query;
    searchUsers(searchQuery);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault();
      // Add the first search result
      addRecipient(searchResults[0]);
    }
  };

  const addRecipient = (user) => {
    // Ensure user has an id
    if (!user || !user.id) {
      console.error("Invalid user object:", user);
      setError("Invalid user selected");
      return;
    }
    
    if (!recipients.find((r) => r.id === user.id)) {
      setRecipients([...recipients, user]);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
    } else {
      setError("User already tagged");
      setTimeout(() => setError(""), 2000);
    }
  };

  const removeRecipient = (userId) => {
    setRecipients(recipients.filter((r) => r.id !== userId));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;
        const fileType = file.type.startsWith("image/") ? "image" : "file";
        
        setAttachments([
          ...attachments,
          {
            file_name: file.name,
            file_type: fileType,
            file_data: base64Data,
            file_size: file.size
          }
        ]);

        setAttachmentPreviews([
          ...attachmentPreviews,
          {
            name: file.name,
            type: fileType,
            preview: fileType === "image" ? base64Data : null
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setAttachmentPreviews(attachmentPreviews.filter((_, i) => i !== index));
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    
    // Auto-detect @ mentions in the message
    const mentionPattern = /@(\w+)/g;
    const matches = text.match(mentionPattern);
    
    if (matches) {
      // Extract usernames from mentions
      const usernames = matches.map(m => m.substring(1)); // Remove @
      searchAndTagMentions(usernames);
    }
  };

  const searchAndTagMentions = async (usernames) => {
    try {
      for (const username of usernames) {
        // Check if already tagged
        const alreadyTagged = recipients.some(r => r.name.toLowerCase() === username.toLowerCase());
        if (alreadyTagged) continue;
        
        // Search for the user
        const response = await api.get(`/shoutouts/users/search?query=${encodeURIComponent(username)}`);
        if (response.data && response.data.length > 0) {
          const user = response.data[0];
          // Auto-tag the matching user only if we have a valid user object with id
          if (user && user.id && !recipients.find(r => r.id === user.id)) {
            setRecipients(prev => [...prev, user]);
          }
        }
      }
    } catch (err) {
      console.error("Error searching mentions:", err);
    }
  };

  const addEmoji = (emoji) => {
    const attachment = {
      file_name: emoji,
      file_type: "emoji",
      file_data: emoji,
      file_size: emoji.length
    };
    setAttachments([...attachments, attachment]);
    setAttachmentPreviews([
      ...attachmentPreviews,
      {
        name: emoji,
        type: "emoji",
        preview: emoji
      }
    ]);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!message.trim() && attachments.length === 0) {
      setError("Message or attachment is required");
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
        attachments: attachments
      });

      setMessage("");
      setRecipients([]);
      setAttachments([]);
      setAttachmentPreviews([]);
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
            onChange={handleMessageChange}
            placeholder="Write your shout-out message here... (Use @username to mention people)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="5"
          />
        </div>

        {/* Attachment Preview */}
        {attachmentPreviews.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments ({attachmentPreviews.length})
            </label>
            <div className="flex flex-wrap gap-3">
              {attachmentPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  {preview.type === "image" && preview.preview && (
                    <img 
                      src={preview.preview} 
                      alt={preview.name}
                      className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  {preview.type === "emoji" && (
                    <div className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 text-4xl">
                      {preview.preview}
                    </div>
                  )}
                  {preview.type === "file" && (
                    <div className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 flex-col">
                      <span className="text-2xl">📄</span>
                      <span className="text-xs text-gray-600 text-center px-1 truncate">{preview.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachment Controls */}
        <div className="mb-4 flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition">
            <span className="text-lg">🖼️</span>
            <span className="text-sm font-medium">Add Image</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2"
          >
            <span className="text-lg">😊</span>
            <span className="text-sm font-medium">Add Emoji</span>
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition">
            <span className="text-lg">📎</span>
            <span className="text-sm font-medium">Add File</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Select an emoji:</p>
            <div className="grid grid-cols-10 gap-2">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl hover:scale-125 transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

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
              onKeyDown={handleSearchKeyDown}
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
