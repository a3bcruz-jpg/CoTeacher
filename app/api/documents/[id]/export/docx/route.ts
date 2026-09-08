import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { documentAsDocx } from "@/lib/documents/docx";
import { sanitizeFilename } from "@/lib/documents/export";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const document = await prisma.document.findFirst({ where: { id: params.id, userId: user.id }, select: { title: true, content: true } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const buffer = await documentAsDocx(document.title, document.content);
  return new NextResponse(buffer as BodyInit, { status: 200, headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="${sanitizeFilename(document.title)}.docx"`, "Cache-Control": "private, no-store" } });
}
