"use client";

export default function ExportButton({ documentId }: { documentId: string }) {
  function exportDocument(format: "txt" | "docx" | "pdf") {
    const path = format === "txt" ? `/api/documents/${documentId}/export?format=txt` : `/api/documents/${documentId}/export/${format}`;
    window.location.href = path;
  }
  return <div className="export-actions"><button type="button" className="secondary-button" onClick={() => exportDocument("txt")}>TXT</button><button type="button" className="secondary-button" onClick={() => exportDocument("docx")}>DOCX</button><button type="button" className="secondary-button" onClick={() => exportDocument("pdf")}>PDF</button></div>;
}
