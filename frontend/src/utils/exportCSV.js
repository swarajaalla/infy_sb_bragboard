export function exportReportsToCSV(reports, shoutouts) {
  const rows = reports
    .map((r) => {
      const shoutout = shoutouts.find(
        (s) => s.id === r.shoutout_id
      );

      if (!shoutout) return null; // 👈 IMPORTANT SAFETY

      return {
        report_id: r.id,
        reason: r.reason,
        shoutout_message: shoutout.message,
        sender: shoutout.sender?.name || "Unknown",
        reported_by: r.reported_by?.name || "Unknown",
      };
    })
    .filter(Boolean); // removes nulls safely

  if (rows.length === 0) {
    alert("No valid reports to export");
    return;
  }

  const csv =
    "Report ID,Reason,Shoutout,Sender,Reported By\n" +
    rows
      .map((r) =>
        `"${r.report_id}","${r.reason}","${r.shoutout_message}","${r.sender}","${r.reported_by}"`
      )
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "reported_shoutouts.csv";
  a.click();
}
