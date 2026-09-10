import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DocumentEditor from "./DocumentEditor";
import ExportButton from "./ExportButton";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    select: { id: true, title: true, content: true, updatedAt: true },
  });
  if (!document) notFound();

  return (
    <main className="main">
      <div className="header">
        <div>
          <div className="eyebrow">Document editor</div>
          <h1>{document.title}</h1>
          <p className="subtitle">Last updated {document.updatedAt.toLocaleString()}</p>
        </div>
        <div className="header-actions">
          <a className="secondary-button" href="/documents">Documents</a>
          <ExportButton documentId={document.id} />
        </div>
      </div>
      <DocumentEditor document={document} />
    </main>
  );
}
