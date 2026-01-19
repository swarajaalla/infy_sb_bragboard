import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportLeaderboardToPDF(
  topContributors,
  mostAppreciated
) {
  const doc = new jsPDF();

  // ===== Title =====
  doc.setFontSize(16);
  doc.text("Company Leaderboard", 14, 12);

  // ===== Top Contributors =====
  doc.setFontSize(12);
  doc.text("Top Contributors", 14, 22);

  autoTable(doc, {
    startY: 26,
    head: [["Rank", "Name", "Shoutouts Sent"]],
    body: topContributors.map((u, i) => [
      i + 1,
      u.name,
      u.count,
    ]),
  });

  // ===== Most Appreciated =====
  const nextY = doc.lastAutoTable.finalY + 10;

  doc.text("Most Appreciated", 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    head: [["Rank", "Name", "Times Appreciated"]],
    body: mostAppreciated.map((u, i) => [
      i + 1,
      u.name,
      u.count,
    ]),
  });

  doc.save("leaderboard.pdf");
}
