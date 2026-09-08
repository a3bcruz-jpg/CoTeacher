import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const document = await prisma.document.findFirst({ where: { id: params.id, userId: user.id }, select: { title: true, content: true } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "txt";
  if (format !== "txt") return NextResponse.json({ error: "Only TXT export is currently enabled." }, { status: 400 });

  const safeTitle = document.title.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "document";
  return new NextResponse(`${document.title}\n\n${document.content}`, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${safeTitle}.txt"`, "Cache-Control": "no-store" } });
}
