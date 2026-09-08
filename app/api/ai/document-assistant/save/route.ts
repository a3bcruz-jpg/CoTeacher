import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { title?: unknown; content?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!title) return NextResponse.json({ error: "Document title is required." }, { status: 400 });
  if (!content) return NextResponse.json({ error: "Document content is required." }, { status: 400 });
  const document = await prisma.document.create({ data: { userId: user.id, title, content, status: "DRAFT" } });
  const version = await prisma.documentVersion.create({ data: { documentId: document.id, userId: user.id, version: 1, content } });
  return NextResponse.json({ document, version }, { status: 201 });
}
