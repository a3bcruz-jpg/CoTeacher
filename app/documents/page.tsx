import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date) {
  return value.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function DocumentsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, status: true, updatedAt: true, template: { select: { name: true } } },
  });

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <div className="eyebrow">CoTeacher workspace</div>
          <h1>Documents</h1>
          <p className="subtitle">Create, review, edit, version, and export your teacher documents.</p>
        </div>
        <div className="header-actions">
          <a className="secondary-button" href="/">Dashboard</a>
          <a className="primary-button" href="/ai/document-assistant">Create with AI</a>
        </div>
      </header>

      <section className="card">
        <div className="card-title">
          <h2>My documents</h2>
          <span className="stat-label">{documents.length} shown</span>
        </div>
        {documents.length ? (
          <div className="document-list">
            {documents.map((document) => (
              <a className="document" href={`/documents/${document.id}`} key={document.id}>
                <div>
                  <div className="document-name">{document.title}</div>
                  <div className="document-meta">{document.template?.name || "General document"} · {document.status} · Updated {formatDate(document.updatedAt)}</div>
                </div>
                <span className="stat-label">Open →</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No documents yet</h3>
            <p>Start with the AI Document Assistant to turn your notes into a structured draft.</p>
            <a className="primary-button" href="/ai/document-assistant">Create your first document</a>
          </div>
        )}
      </section>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-title"><h2>AI Document Assistant</h2><span className="stat-label">Draft aid</span></div>
          <p className="subtitle">Generate structured drafts from teacher-provided information, then review and save them here.</p>
          <div style={{ marginTop: 16 }}><a className="primary-button" href="/ai/document-assistant">Open assistant</a></div>
        </div>
        <div className="card">
          <div className="card-title"><h2>Document workflow</h2></div>
          <p className="subtitle">Every saved document can keep version history and be exported to PDF. AI output remains a draft until you review it.</p>
        </div>
      </section>
    </main>
  );
}
