function pdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/([\\()])/g, "\\$1");
}

function wrapLine(value: string, max = 95) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function documentAsPdf(title: string, content: string) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 54;
  const lineHeight = 14;
  const pages: string[][] = [];
  let page: string[] = [];

  const push = (line: string) => {
    if (page.length >= 50) {
      pages.push(page);
      page = [];
    }
    page.push(line);
  };

  push(`BT /F2 18 Tf ${margin} ${pageHeight - 60} Td (${pdfText(title)}) Tj ET`);
  let y = pageHeight - 94;
  for (const raw of (content || "").split(/\r?\n/)) {
    const lines = raw.trim() ? wrapLine(raw) : [""];
    for (const line of lines) {
      if (y < 58) {
        pages.push(page);
        page = [];
        y = pageHeight - 58;
      }
      if (line) push(`BT /F1 10 Tf ${margin} ${y} Td (${pdfText(line)}) Tj ET`);
      y -= lineHeight;
    }
  }
  if (page.length || !pages.length) pages.push(page);

  const objects: string[] = [];
  const add = (body: string) => { objects.push(body); return objects.length; };
  const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pagesId = add("<< /Type /Pages /Kids [] /Count 0 >>");
  const pageIds: number[] = [];

  for (const commands of pages) {
    const stream = commands.join("\n");
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export function sanitizeFilename(value: string) {
  return (value || "document").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "document";
}
