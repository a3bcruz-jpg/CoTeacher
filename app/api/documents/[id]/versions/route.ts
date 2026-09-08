import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const document = await prisma.document.findFirst({ where: { id: params.id, userId: user.id }, select: { id: true } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const versions = await prisma.documentVersion.findMany({ where: { documentId: document.id, userId: user.id }, orderBy: { version: "desc" } });
  return NextResponse.json({ versions });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { content?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const content = typeof body.content === "string" ? body.content : "";
  if (!content.trim()) return NextResponse.json({ error: "Document content is required." }, { status: 400 });
  const document = await prisma.document.findFirst({ where: { id: params.id, userId: user.id }, select: { id: true } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const latest = await prisma.documentVersion.findFirst({ where: { documentId: document.id, userId: user.id }, orderBy: { version: "desc" }, select: { version: true } });
  const version = (latest?.version ?? 0) + 1;
  const saved = await prisma.$transaction(async (tx) => {
    const created = await tx.documentVersion.create({ data: { documentId: document.id, userId: user.id, version, content } });
    await tx.document.update({ where: { id: document.id }, data: { content, status: "DRAFT" } });
    return created;
  });
  return NextResponse.json({ version: saved }, { status: 201 });
}
