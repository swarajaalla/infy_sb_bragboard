export function exportEmployeesToCSV(employees) {
  if (!employees || employees.length === 0) {
    alert("No employees to export");
    return;
  }

  const headers = [
    "Employee ID",
    "Name",
    "Email",
    "Joined At",
    "Contributions",
    "Reports Made",
    "Reports On Him",
    "Most Appreciated",
  ];

  const rows = employees.map((u) => [
    u.id,
    u.name,
    u.email,
    u.joined_at,
    u.contributions,
    u.reports_made,
    u.reports_on_him,
    u.most_appreciated,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows]
      .map((row) => row.map(String).join(","))
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "employees.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
