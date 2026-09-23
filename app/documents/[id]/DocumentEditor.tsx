"use client";

import { useEffect, useState } from "react";

type Version = { id: string; version: number; content: string | null; createdAt: string };
type DocumentState = {
  id: string;
  title: string;
  content: string | null;
  status: "DRAFT" | "FINAL" | "ARCHIVED";
  updatedAt: string | Date;
};

export default function DocumentEditor({ document }: { document: DocumentState }) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content || "");
  const [versions, setVersions] = useState<Version[]>([]);
  const [status, setStatus] = useState(document.status);
  const [message, setMessage] = useState("");

  async function loadVersions() {
    const r = await fetch(`/api/documents/${document.id}/versions`, { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setVersions(d.versions || []);
    }
  }

  useEffect(() => {
    loadVersions();
  }, []);

  async function saveTitle() {
    setMessage("Saving title...");
    const r = await fetch(`/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMessage(d.error || "Unable to save title.");
      return;
    }
    setMessage("Title saved.");
  }

  async function saveVersion() {
    setMessage("Saving version...");
    const r = await fetch(`/api/documents/${document.id}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMessage(d.error || "Unable to save.");
      return;
    }
    setStatus("DRAFT");
    setMessage(`Saved as version ${d.version.version}.`);
    await loadVersions();
  }

  async function restoreVersion(versionId: string) {
    setMessage("Restoring version...");
    const r = await fetch(`/api/documents/${document.id}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", versionId }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMessage(d.error || "Unable to restore version.");
      return;
    }
    setContent(d.version?.content || "");
    setStatus("DRAFT");
    setMessage(d.message || "Version restored.");
    await loadVersions();
  }

  async function changeStatus(action: "finalize" | "archive") {
    const label = action === "finalize" ? "finalize" : "archive";
    if (!window.confirm(`Are you sure you want to ${label} this document?`)) return;

    setMessage(`${label === "finalize" ? "Finalizing" : "Archiving"} document...`);
    const r = await fetch(`/api/documents/${document.id}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMessage(d.error || `Unable to ${label} document.`);
      return;
    }
    setStatus(d.document?.status || status);
    setMessage(d.message || `Document ${label}d.`);
  }

  return (
    <div className="editor-layout">
      <section className="card">
        <div className="card-title">
          <h2>Document details</h2>
          <span className={`status-chip status-${status.toLowerCase()}`}>{status}</span>
        </div>

        <div className="document-title-editor">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </label>
          <button className="secondary-button" type="button" onClick={saveTitle}>Save title</button>
        </div>

        <div className="card-title" style={{ marginTop: 22 }}>
          <h2>Draft content</h2>
          <button className="primary-button" type="button" onClick={saveVersion}>Save version</button>
        </div>

        <textarea
          className="draft-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={28}
          aria-label="Document content"
        />

        <div className="document-actions">
          <button className="secondary-button" type="button" onClick={() => changeStatus("finalize")} disabled={status === "FINAL"}>
            Finalize
          </button>
          <button className="secondary-button danger-button" type="button" onClick={() => changeStatus("archive")} disabled={status === "ARCHIVED"}>
            Archive
          </button>
        </div>

        {message && <p className="form-status" role="status">{message}</p>}
        <p className="disclaimer">AI generated content is draft material and should be reviewed before finalizing. Saving edited content creates a new version.</p>
      </section>

      <aside className="card">
        <div className="card-title">
          <h2>Version history</h2>
          <span className="stat-label">{versions.length} versions</span>
        </div>

        {versions.length ? (
          <div className="version-list">
            {versions.map((version) => (
              <div className="version-item" key={version.id}>
                <div>
                  <strong>Version {version.version}</strong>
                  <span>{new Date(version.createdAt).toLocaleString()}</span>
                </div>
                <div className="version-actions">
                  <button className="secondary-button" type="button" onClick={() => setContent(version.content || "")}>
                    Load
                  </button>
                  <button className="primary-button" type="button" onClick={() => restoreVersion(version.id)}>
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>No saved versions yet.</p></div>
        )}

        <p className="disclaimer">Load previews a version in the editor. Restore creates a new version so your existing history remains intact.</p>
      </aside>
    </div>
  );
}
