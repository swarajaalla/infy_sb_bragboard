import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";

export default function ShoutoutCard({
  shoutout,
  allowReact,
  allowComment,
  currentUser,
}) {
  return (
    <div className="p-4 bg-indigo-50 rounded-lg space-y-3">
      <p className="text-sm text-gray-800">{shoutout.message}</p>

      <p className="text-xs text-gray-400">
        From {shoutout.sender?.name}
      </p>

      {/* 
        Reaction rules:
        - Received by Me → show always + clickable
        - Posted by Me → show ONLY if someone reacted (read-only)
      */}
      <ReactionBar
        shoutoutId={shoutout.id}
        allowReact={allowReact}
        showWhenEmpty={allowReact} 
        /*
          allowReact === true  → Received by Me → show always
          allowReact === false → Posted by Me → show only if count > 0
        */
      />

      <CommentSection
        shoutoutId={shoutout.id}
        allowComment={allowComment}
        currentUser={currentUser}
        recipients={shoutout.recipients}
      />
    </div>
  );
}
