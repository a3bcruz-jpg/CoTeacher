import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { documentAsText, sanitizeFilename } from "@/lib/documents/export";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const format = new URL(request.url).searchParams.get("format") || "txt";
  if (format !== "txt") return NextResponse.json({ error: "Unsupported export format." }, { status: 400 });
  const document = await prisma.document.findFirst({ where: { id: params.id, userId: user.id }, select: { title: true, content: true } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  return new NextResponse(documentAsText(document.title, document.content), { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${sanitizeFilename(document.title)}.txt"`, "Cache-Control": "private, no-store" } });
}
