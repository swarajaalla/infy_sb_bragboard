import { exportMasterReport } from "../services/api";

export default function AdminSettings() {
  const token = localStorage.getItem("token");

  const handleExport = async (format) => {
    try {
      const res = await exportMasterReport(token, format);

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        format === "pdf"
          ? "bragboard_master_report.pdf"
          : "bragboard_master_report.zip";

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-8">
      <h3 className="text-xl font-semibold">⚙️ Settings</h3>

      {/* ===== GENERAL SETTINGS ===== */}
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked />
          <span>Enable live activity refresh</span>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked />
          <span>Show notifications</span>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" disabled />
          <span className="text-gray-400">Dark mode (future)</span>
        </label>
      </div>

      {/* ===== DIVIDER ===== */}
      <hr />

      {/* ===== DATA EXPORT ===== */}
      <div>
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📤 Data Export
        </h4>

        <p className="text-sm text-gray-500 mb-4">
          Download complete platform data for audit or reporting purposes.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleExport("csv")}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >
            ⬇️ Export CSV (ZIP)
          </button>

          <button
            onClick={() => handleExport("pdf")}
            className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition"
          >
            📄 Export PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
