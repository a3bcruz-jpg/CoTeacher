import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai/provider";
import { buildLessonPlanPrompt, validateLessonPlanInput, type LessonPlanInput } from "@/lib/lesson-planner";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: LessonPlanInput;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const input: LessonPlanInput = { gradeLevel: typeof body.gradeLevel === "string" ? body.gradeLevel : "", subject: typeof body.subject === "string" ? body.subject : "", topic: typeof body.topic === "string" ? body.topic : "", learningCompetency: typeof body.learningCompetency === "string" ? body.learningCompetency : "", durationMinutes: Number(body.durationMinutes), learnerContext: typeof body.learnerContext === "string" ? body.learnerContext : "" };
  const errors = validateLessonPlanInput(input);
  if (errors.length) return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  const provider = getAIProvider();
  if (!provider) return NextResponse.json({ error: "AI generation is not configured." }, { status: 503 });
  try {
    const draft = await provider.generateText({ system: "You are CoTeacher. Produce careful, practical lesson-plan drafts for Philippine teachers. Never fabricate official curriculum requirements or learner facts. Clearly mark missing information.", user: buildLessonPlanPrompt(input) });
    return NextResponse.json({ draft });
  } catch { return NextResponse.json({ error: "The AI provider could not generate the lesson plan." }, { status: 502 }); }
}
