export default function StatCard({ label, value, icon, color }) {
  const borderColors = {
    blue: "border-blue-500",
    purple: "border-purple-500",
    green: "border-green-500",
    orange: "border-orange-500",
  };

  const iconBg = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-6 flex items-center gap-5 
      border-l-8 ${borderColors[color]} hover:shadow-xl transition`}
    >
      {/* ICON */}
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl ${iconBg[color]}`}
      >
        {icon}
      </div>

      {/* TEXT */}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
