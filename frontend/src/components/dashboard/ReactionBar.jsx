import { useEffect, useState } from "react";
import { getReactions, reactToShoutout } from "../../api/reactions";
import axiosClient from "../../api/axiosClient";

export default function ReactionBar({
  shoutoutId,
  allowReact,
  showWhenEmpty, // 👈 NEW
}) {
  const [counts, setCounts] = useState(null);
const [userReaction, setUserReaction] = useState(null);


  useEffect(() => {
    const load = async () => {
      const res = await getReactions(shoutoutId);
      setCounts(res.data.counts);
      setUserReaction(res.data.current_user_reaction);
    };
    load();
  }, [shoutoutId]);

  // If reactions not loaded yet
  if (!counts) return null;

  const totalReactions =
    counts.like + counts.clap + counts.star;

  // 🔴 CORE RULE:
  // For "Posted by Me", show reactions ONLY if someone reacted
  if (!showWhenEmpty && totalReactions === 0) {
    return null;
  }

  const handleReact = async (type) => {
  if (!allowReact) return;

  try {
    // 🔁 Toggle behavior
    if (userReaction === type) {
      // Delete my reaction
      await axiosClient.delete(
        `/api/reactions/by-shoutout/${shoutoutId}`
      );
    } else {
      // Add / update reaction
      await reactToShoutout(shoutoutId, type);
    }

    const res = await getReactions(shoutoutId);
    setCounts(res.data.counts);
    setUserReaction(res.data.current_user_reaction);
  } catch (e) {
    alert("Failed to update reaction");
  }
};


  const btn = (type) =>
    `px-3 py-1 rounded-full text-sm border transition
     ${
       userReaction === type
         ? "bg-indigo-600 text-white border-indigo-600"
         : "bg-white text-gray-600"
     }
     ${
       allowReact
         ? "hover:bg-indigo-50"
         : "cursor-default opacity-70"
     }`;

  return (
    <div className="flex gap-3 pt-2">
      <button className={btn("like")} onClick={() => handleReact("like")}>
        👍 {counts.like}
      </button>
      <button className={btn("clap")} onClick={() => handleReact("clap")}>
        👏 {counts.clap}
      </button>
      <button className={btn("star")} onClick={() => handleReact("star")}>
        ⭐ {counts.star}
      </button>
    </div>
  );
}
