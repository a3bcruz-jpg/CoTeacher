"use client";

export default function ExportButton({ documentId }: { documentId: string }) {
  function exportTxt() { window.location.href = `/api/documents/${documentId}/export?format=txt`; }
  return <button type="button" className="secondary-button" onClick={exportTxt}>Export TXT</button>;
}
