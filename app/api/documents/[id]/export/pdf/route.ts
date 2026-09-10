import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { documentAsPdf, sanitizeFilename } from "@/lib/documents/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    select: { title: true, content: true },
  });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const bytes = documentAsPdf(document.title, document.content || "");
  return new NextResponse(bytes as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(document.title)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
