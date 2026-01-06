import ShoutoutSection from "./ShoutoutSection";

export default function ShoutoutFeed({ shoutouts, currentUser }) {
  const sent = shoutouts.filter(
    (s) => s.sender && s.sender.id === currentUser.id
  );

  const received = shoutouts.filter((s) =>
    s.recipients?.some((r) => r.id === currentUser.id)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ShoutoutSection
        title="Posted by Me"
        shoutouts={sent}
        type="sent"
        currentUser={currentUser}
      />

      <ShoutoutSection
        title="Received by Me"
        shoutouts={received}
        type="received"
        currentUser={currentUser}
      />
    </div>
  );
}
