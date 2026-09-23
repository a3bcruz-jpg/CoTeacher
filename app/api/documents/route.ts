import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { template: { select: { name: true } } },
  });

  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const templateId = typeof body.templateId === "string" && body.templateId.trim() ? body.templateId.trim() : null;
    const generationId = typeof body.generationId === "string" && body.generationId.trim() ? body.generationId.trim() : null;

    if (!title || title.length > 200) {
      return NextResponse.json({ error: "A document title between 1 and 200 characters is required." }, { status: 400 });
    }
    if (content.length > 100000) {
      return NextResponse.json({ error: "Document content is too large." }, { status: 400 });
    }

    if (templateId) {
      const template = await prisma.documentTemplate.findFirst({ where: { id: templateId, status: "ACTIVE" }, select: { id: true } });
      if (!template) return NextResponse.json({ error: "Document template not found." }, { status: 400 });
    }

    const generation = generationId
      ? await prisma.aIGeneration.findFirst({ where: { id: generationId, userId: user.id }, select: { id: true } })
      : null;

    if (generationId && !generation) {
      return NextResponse.json({ error: "AI generation not found or does not belong to this account." }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: { userId: user.id, templateId, title, content: content || null, status: "DRAFT" },
      });

      if (content) {
        await tx.documentVersion.create({ data: { documentId: document.id, userId: user.id, version: 1, content } });
      }

      if (generation) {
        await tx.aIGeneration.update({ where: { id: generation.id }, data: { documentId: document.id } });
      }

      return document;
    });

    return NextResponse.json({ document: result, generationId: generation?.id ?? null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create document." }, { status: 500 });
  }
}
