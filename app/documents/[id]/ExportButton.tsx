"use client";

export default function ExportButton({ documentId }: { documentId: string }) {
  return (
    <button type="button" className="secondary-button" onClick={() => { window.location.href = `/api/documents/${documentId}/export/pdf`; }}>
      Export PDF
    </button>
  );
}
