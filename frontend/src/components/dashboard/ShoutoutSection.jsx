import ShoutoutCard from "./ShoutoutCard";

export default function ShoutoutSection({
  title,
  shoutouts,
  type,
  currentUser,
}) {
  const groupByDepartment = (items) =>
    items.reduce((acc, item) => {
      const dept =
        type === "sent"
          ? item.recipients.map((r) => r.department).join(", ")
          : item.sender.department;

      acc[dept] = acc[dept] || [];
      acc[dept].push(item);
      return acc;
    }, {});

  const grouped = groupByDepartment(shoutouts);

  return (
    <div className="bg-white rounded-2xl shadow border overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 font-semibold">{title}</div>

      <div className="p-6 space-y-6 border-t">
        {Object.keys(grouped).length === 0 && (
          <p className="text-sm text-gray-400">No shoutouts yet</p>
        )}

        {Object.entries(grouped).map(([dept, items]) => (
          <div key={dept}>
            <p className="text-xs font-semibold text-gray-500 mb-2">{dept}</p>

            <div className="space-y-3">
              {items.map((s) => (
                <ShoutoutCard
                  key={s.id}
                  shoutout={s}
                  allowReact={type === "received"}
                  allowComment={type === "received"}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
