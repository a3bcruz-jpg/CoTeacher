import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const documents = await prisma.document.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 100 });
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  if (!title) return NextResponse.json({ error: "Document title is required." }, { status: 400 });
  const document = await prisma.document.create({ data: { userId: user.id, title, content, status: "DRAFT" } });
  return NextResponse.json({ document }, { status: 201 });
}
