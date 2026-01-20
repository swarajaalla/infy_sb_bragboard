import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function ReactionButtons({ shoutoutId, reactions, onReactionUpdate }) {
  const { user } = useContext(AuthContext);
  const [localReactions, setLocalReactions] = useState(reactions || []);
  const [loading, setLoading] = useState(false);
  const [userReactions, setUserReactions] = useState(
    reactions?.reduce((acc, r) => {
      // Only mark as true if the reaction is from the current user
      if (user && r.user.id === user.id) {
        acc[r.type] = true;
      }
      return acc;
    }, {}) || {}
  );

  const reactionTypes = [
    { type: "heart", label: "❤️", name: "Like" },
    { type: "thumbs_up", label: "👍", name: "Thumbs Up" },
    { type: "clap", label: "👏", name: "Clap" },
  ];

  const handleReaction = async (reactionType) => {
    setLoading(true);
    try {
      if (userReactions[reactionType]) {
        // Remove reaction
        await api.delete(`/shoutouts/${shoutoutId}/react/${reactionType}`);
        const updated = localReactions.filter((r) => r.type !== reactionType);
        setLocalReactions(updated);
        setUserReactions({ ...userReactions, [reactionType]: false });
      } else {
        // Add reaction
        await api.post(`/shoutouts/${shoutoutId}/react/${reactionType}`);
        const updated = [
          ...localReactions,
          { type: reactionType, user: { id: 1, name: "You" } },
        ];
        setLocalReactions(updated);
        setUserReactions({ ...userReactions, [reactionType]: true });
      }
      onReactionUpdate && onReactionUpdate();
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
      // Refresh reactions on error
      onReactionUpdate && onReactionUpdate();
    } finally {
      setLoading(false);
    }
  };

  // Count reactions by type
  const reactionCounts = {};
  reactionTypes.forEach((rt) => {
    reactionCounts[rt.type] = localReactions.filter((r) => r.type === rt.type).length;
  });

  return (
    <div className="flex flex-wrap gap-2 mt-4 items-center">
      {reactionTypes.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => handleReaction(reaction.type)}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
            userReactions[reaction.type]
              ? "bg-blue-100 text-blue-600 border-2 border-blue-400"
              : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200"
          } disabled:opacity-50`}
          title={`${reaction.name}: ${reactionCounts[reaction.type]} reaction${
            reactionCounts[reaction.type] !== 1 ? "s" : ""
          }`}
        >
          <span className="text-lg">{reaction.label}</span>
          {reactionCounts[reaction.type] > 0 && (
            <span className="text-xs font-semibold">{reactionCounts[reaction.type]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
