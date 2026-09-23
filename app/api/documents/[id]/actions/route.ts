import { isSameOrigin, originError } from "@/lib/security";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionBody = {
  action?: unknown;
  versionId?: unknown;
};

export async function POST(request: Request, {
  if (!isSameOrigin(request)) return originError(); params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: ActionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!["restore", "finalize", "archive"].includes(action)) {
    return NextResponse.json({ error: "Unsupported document action." }, { status: 400 });
  }

  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    select: { id: true, content: true, status: true },
  });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  if (action === "restore") {
    const versionId = typeof body.versionId === "string" ? body.versionId : "";
    if (!versionId) return NextResponse.json({ error: "Version is required for restore." }, { status: 400 });

    const version = await prisma.documentVersion.findFirst({
      where: { id: versionId, documentId: document.id, userId: user.id },
      select: { content: true },
    });
    if (!version) return NextResponse.json({ error: "Document version not found." }, { status: 404 });

    const latest = await prisma.documentVersion.findFirst({
      where: { documentId: document.id, userId: user.id },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const result = await prisma.$transaction(async (tx) => {
      const createdVersion = await tx.documentVersion.create({
        data: {
          documentId: document.id,
          userId: user.id,
          version: nextVersion,
          content: version.content,
        },
      });
      const updatedDocument = await tx.document.update({
        where: { id: document.id },
        data: { content: version.content, status: "DRAFT" },
        select: { id: true, status: true, updatedAt: true },
      });
      return { createdVersion, updatedDocument };
    });

    return NextResponse.json({
      document: result.updatedDocument,
      version: result.createdVersion,
      message: `Restored as version ${nextVersion}.`,
    });
  }

  const status = action === "finalize" ? "FINAL" : "ARCHIVED";
  if (document.status === status) {
    return NextResponse.json({ document: { id: document.id, status }, message: `Document is already ${status.toLowerCase()}.` });
  }

  const updated = await prisma.document.update({
    where: { id: document.id },
    data: { status },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json({
    document: updated,
    message: status === "FINAL" ? "Document finalized." : "Document archived.",
  });
}
