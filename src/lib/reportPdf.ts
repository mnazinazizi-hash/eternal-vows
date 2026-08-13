export type ReportMetric = {
  label: string;
  value: string | number;
  detail: string;
  accent: "gold" | "green" | "rose" | "cream";
};

type WeddingReportOptions = {
  title: string;
  filename: string;
  metrics: ReportMetric[];
  columns: string[];
  rows: string[][];
};

type Rgb = [number, number, number];

const colors: Record<string, Rgb> = {
  gold: [128, 96, 10],
  goldLight: [247, 239, 217],
  green: [61, 86, 37],
  greenLight: [235, 241, 228],
  rose: [143, 74, 42],
  roseLight: [251, 233, 227],
  cream: [250, 248, 243],
  ink: [45, 39, 28],
  muted: [103, 95, 82],
  line: [232, 226, 213],
};

export async function downloadWeddingReportPdf({
  title,
  filename,
  metrics,
  columns,
  rows,
}: WeddingReportOptions) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const document = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 38;
  const generatedAt = new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  document.setFillColor(...colors.cream);
  document.rect(0, 0, pageWidth, pageHeight, "F");

  document.setFillColor(...colors.gold);
  document.roundedRect(margin, 28, pageWidth - margin * 2, 96, 14, 14, "F");
  document.setDrawColor(220, 190, 94);
  document.setLineWidth(0.65);
  document.circle(margin + 44, 58, 25, "S");
  document.circle(margin + 66, 78, 16, "S");
  document.circle(margin + 28, 91, 12, "S");
  document.setTextColor(255, 255, 255);
  document.setFont("times", "bold");
  document.setFontSize(30);
  document.text("Elena & Marcus", margin + 108, 74);
  document.setFont("helvetica", "bold");
  document.setFontSize(10);
  document.setCharSpace(2.3);
  document.text(title.toUpperCase(), margin + 110, 98);
  document.setCharSpace(0);
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.text(generatedAt, pageWidth - margin - 30, 77, {
    align: "right",
  });

  const cardGap = 12;
  const cardWidth =
    (pageWidth - margin * 2 - cardGap * (metrics.length - 1)) /
    metrics.length;
  const cardY = 148;
  metrics.forEach((metric, index) => {
    const x = margin + index * (cardWidth + cardGap);
    const accent =
      metric.accent === "green"
        ? colors.green
        : metric.accent === "rose"
          ? colors.rose
          : colors.gold;
    const accentLight =
      metric.accent === "green"
        ? colors.greenLight
        : metric.accent === "rose"
          ? colors.roseLight
          : colors.goldLight;

    document.setFillColor(255, 255, 255);
    document.setDrawColor(...colors.line);
    document.roundedRect(x, cardY, cardWidth, 116, 12, 12, "FD");
    document.setFillColor(
      accentLight[0],
      accentLight[1],
      accentLight[2]
    );
    document.circle(x + 28, cardY + 29, 16, "F");
    document.setTextColor(accent[0], accent[1], accent[2]);
    document.setFont("helvetica", "bold");
    document.setFontSize(12);
    document.text(index === 0 ? "*" : index === 1 ? "+" : index === 2 ? "-" : "o", x + 28, cardY + 34, { align: "center" });
    document.setTextColor(...colors.ink);
    document.setFontSize(8.5);
    document.text(metric.label.toUpperCase(), x + 52, cardY + 31);
    document.setFont("times", "normal");
    document.setFontSize(24);
    document.text(String(metric.value), x + 24, cardY + 73);
    document.setFont("helvetica", "normal");
    document.setFontSize(8.5);
    document.setTextColor(...colors.muted);
    const detail = document.splitTextToSize(
      metric.detail,
      cardWidth - 42
    );
    document.text(detail, x + 24, cardY + 96);
  });

  document.setTextColor(...colors.gold);
  document.setFont("times", "bold");
  document.setFontSize(17);
  document.text(title.toUpperCase(), margin, 306);

  autoTable(document, {
    startY: 324,
    head: [columns],
    body: rows,
    theme: "grid",
    margin: { left: margin, right: margin, bottom: 48 },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 9,
      textColor: colors.ink,
      lineColor: colors.line,
      lineWidth: 0.45,
      valign: "middle",
    },
    headStyles: {
      fillColor: colors.green,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: { fillColor: [253, 252, 249] },
    didDrawPage: () => {
      document.setDrawColor(213, 192, 130);
      document.line(margin, pageHeight - 31, pageWidth - margin, pageHeight - 31);
      document.setTextColor(...colors.muted);
      document.setFont("helvetica", "normal");
      document.setFontSize(8);
      document.text(
        "This report is generated from Eternal Vows Wedding Management System.",
        pageWidth / 2,
        pageHeight - 17,
        { align: "center" }
      );
    },
  });

  document.save(filename);
}
