import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportEmployeesToPDF(employees) {
  if (!employees || employees.length === 0) {
    alert("No employees to export");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Employees Report", 14, 15);

  const tableColumn = [
    "ID",
    "Name",
    "Email",
    "Joined",
    "Contributions",
    "Reports Made",
    "Reports On Him",
    "Most Appreciated",
  ];

  const tableRows = employees.map((u) => [
    u.id,
    u.name,
    u.email,
    u.joined_at,
    u.contributions,
    u.reports_made,
    u.reports_on_him,
    u.most_appreciated,
  ]);

  // ✅ THIS IS THE FIX
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save("employees.pdf");
}
