import { isSameOrigin, originError } from "@/lib/security";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return originError();
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 120000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: unknown; content?: unknown; generationId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const generationId = typeof body.generationId === "string" ? body.generationId.trim() : "";

  if (!title || title.length > 200) return NextResponse.json({ error: "Document title must be between 1 and 200 characters." }, { status: 400 });
  if (!content) return NextResponse.json({ error: "Document content is required." }, { status: 400 });
  if (content.length > 100000) return NextResponse.json({ error: "Document content is too large." }, { status: 400 });

  try {
    const generation = generationId
      ? await prisma.aIGeneration.findFirst({ where: { id: generationId, userId: user.id, feature: "document-assistant" }, select: { id: true } })
      : null;

    if (generationId && !generation) {
      return NextResponse.json({ error: "AI generation not found or does not belong to this account." }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: { userId: user.id, title, content, status: "DRAFT" },
      });
      const version = await tx.documentVersion.create({
        data: { documentId: document.id, userId: user.id, version: 1, content },
      });
      if (generation) {
        await tx.aIGeneration.update({ where: { id: generation.id }, data: { documentId: document.id } });
      }
      return { document, version };
    });

    return NextResponse.json({ ...result, generationId: generation?.id ?? null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save document." }, { status: 500 });
  }
}
