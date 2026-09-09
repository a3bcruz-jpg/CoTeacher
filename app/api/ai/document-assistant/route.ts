import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDocumentPrompt, type DocumentAssistantInput } from "@/lib/ai/document-assistant";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: DocumentAssistantInput;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  try {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id }, include: { school: true } });
    const input = { ...body, teacherName: profile?.fullName ?? undefined, schoolName: profile?.school?.name ?? undefined };
    const prompt = buildDocumentPrompt(input);
    const provider = getAIProvider();
    if (!provider) return NextResponse.json({ error: "AI is not configured. Set AI_API_KEY on the server." }, { status: 503 });
    const draft = await provider.generateText({ system: "You are a careful administrative writing assistant. Follow the user's supplied facts and never fabricate information.", user: prompt });
    return NextResponse.json({ draft, context: { teacherName: profile?.fullName ?? null, schoolName: profile?.school?.name ?? null }, disclaimer: "AI assistance is a draft aid. Review all content and verify applicable official requirements before use or submission." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate draft." }, { status: 400 });
  }
}
