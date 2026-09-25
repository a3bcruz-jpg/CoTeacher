import { isSameOrigin, originError } from "@/lib/security";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/provider";

export const runtime = "nodejs";

const LIMIT = 6000;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return originError();
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { message?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
  if (message.length > LIMIT) return NextResponse.json({ error: `Message must be ${LIMIT} characters or fewer.` }, { status: 400 });

  const [profile, tasks, documents] = await Promise.all([
    prisma.teacherProfile.findUnique({ where: { userId: user.id }, include: { school: true } }),
    prisma.task.findMany({ where: { userId: user.id, status: { not: "COMPLETED" } }, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }], take: 12, select: { title: true, dueAt: true, priority: true, status: true, category: true } }),
    prisma.document.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 8, select: { title: true, status: true, updatedAt: true } }),
  ]);

  const context = {
    teacher: profile?.fullName ?? null,
    position: profile?.position ?? null,
    gradeLevel: profile?.gradeLevel ?? null,
    department: profile?.department ?? null,
    school: profile?.school?.name ?? null,
    schoolYear: profile?.schoolYear ?? null,
    openTasks: tasks.map((task) => ({ title: task.title, dueAt: task.dueAt?.toISOString() ?? null, priority: task.priority, status: task.status, category: task.category })),
    recentDocuments: documents.map((document) => ({ title: document.title, status: document.status, updatedAt: document.updatedAt.toISOString() })),
  };

  const provider = getAIProvider();
  if (!provider) return NextResponse.json({ error: "AI is not configured. Set AI_API_KEY on the server." }, { status: 503 });

  try {
    const answer = await provider.generateText({
      system: "You are CoTeacher, a private administrative copilot for one teacher. Use only the supplied user context. Never reveal, infer, or invent data outside that context. Do not claim to know official DepEd requirements unless the user supplied them. Help organize work, summarize the user's workspace, and draft practical next steps. Keep answers concise and actionable. AI output is advisory draft content and requires teacher review.",
      user: `USER CONTEXT:\n${JSON.stringify(context)}\n\nTEACHER REQUEST:\n${message}`,
    });
    return NextResponse.json({ answer, context: { taskCount: tasks.length, documentCount: documents.length } });
  } catch {
    return NextResponse.json({ error: "The AI provider could not answer the request." }, { status: 502 });
  }
}
