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

    const document = await prisma.document.create({
      data: { userId: user.id, templateId, title, content: content || null, status: "DRAFT" },
    });

    if (content) {
      await prisma.documentVersion.create({ data: { documentId: document.id, userId: user.id, version: 1, content } });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create document." }, { status: 500 });
  }
}
