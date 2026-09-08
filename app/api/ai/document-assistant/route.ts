import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLocalDraft, type DocumentAssistantInput } from "@/lib/ai/document-assistant";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: DocumentAssistantInput;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  try {
    const result = createLocalDraft(body);
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id }, include: { school: true } });
    return NextResponse.json({
      ...result,
      context: { teacherName: profile?.fullName ?? null, schoolName: profile?.school?.name ?? null },
      disclaimer: "AI assistance is a draft aid. Review all content and verify applicable official requirements before use or submission.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate draft." }, { status: 400 });
  }
}
