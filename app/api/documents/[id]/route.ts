import { isSameOrigin, originError } from "@/lib/security";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return originError();
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { title?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 200) {
    return NextResponse.json({ error: "A document title between 1 and 200 characters is required." }, { status: 400 });
  }

  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const updated = await prisma.document.update({
    where: { id: document.id },
    data: { title },
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json({ document: updated });
}
