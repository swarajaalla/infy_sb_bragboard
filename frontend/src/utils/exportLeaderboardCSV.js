export function exportLeaderboardToCSV(
  topContributors,
  mostAppreciated
) {
  let csv = "";

  // ===== Top Contributors =====
  csv += "Top Contributors\n";
  csv += "Rank,Name,Shoutouts Sent\n";

  topContributors.forEach((u, i) => {
    csv += `${i + 1},"${u.name}",${u.count}\n`;
  });

  csv += "\n";

  // ===== Most Appreciated =====
  csv += "Most Appreciated\n";
  csv += "Rank,Name,Times Appreciated\n";

  mostAppreciated.forEach((u, i) => {
    csv += `${i + 1},"${u.name}",${u.count}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "leaderboard.csv";
  a.click();
}
