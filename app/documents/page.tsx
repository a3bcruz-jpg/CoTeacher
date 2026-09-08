import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DocumentsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const documents = await prisma.document.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 50 });

  return <main className="main"><div className="header"><div><div className="eyebrow">Workspace</div><h1>Documents</h1><p className="subtitle">Keep your teaching and administrative documents organized in one place.</p></div><button className="primary-button">New document</button></div><section className="card"><div className="card-title"><h2>My documents</h2><span className="stat-label">{documents.length} shown</span></div>{documents.length === 0 ? <div className="empty-state"><h3>No documents yet</h3><p>Create your first document and it will appear here.</p></div> : <div className="document-list">{documents.map((document) => <article className="document" key={document.id}><div><div className="document-name">{document.title}</div><div className="document-meta">Updated {document.updatedAt.toLocaleDateString()}</div></div><span className="badge">{document.status}</span></article>)}</div>}</section></main>;
}
