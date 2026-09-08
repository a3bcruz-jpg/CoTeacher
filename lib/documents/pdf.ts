import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function documentAsPdf(title: string, content: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage();
  const { width, height } = page.getSize();
  let y = height - 60;
  const margin = 54;
  page.drawText(title, { x: margin, y, size: 18, font: titleFont, color: rgb(0, 0, 0) });
  y -= 34;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) { y -= 14; continue; }
    if (y < 55) { page = pdf.addPage(); y = height - 55; }
    page.drawText(line.slice(0, 110), { x: margin, y, size: 10.5, font });
    y -= 16;
  }
  return pdf.save();
}
