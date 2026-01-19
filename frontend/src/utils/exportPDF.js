import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportReportsToPDF(reports, shoutouts) {
  const doc = new jsPDF();

  const rows = reports
    .map((r) => {
      const shoutout = shoutouts.find(
        (s) => s.id === r.shoutout_id
      );

      if (!shoutout) return null;

      return [
        r.id,
        r.reason,
        shoutout.message,
        shoutout.sender?.name || "Unknown",
        r.reported_by?.name || "Unknown",
      ];
    })
    .filter(Boolean);

  if (rows.length === 0) {
    alert("No valid reports to export");
    return;
  }

  doc.text("Reported Shout-outs", 14, 12);

  autoTable(doc, {
    startY: 20,
    head: [["ID", "Reason", "Shoutout", "Sender", "Reported By"]],
    body: rows,
  });

  doc.save("reported_shoutouts.pdf");
}
