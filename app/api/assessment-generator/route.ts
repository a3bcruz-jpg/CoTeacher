import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai/provider";
import { buildAssessmentPrompt, validateAssessmentInput, type AssessmentInput } from "@/lib/assessment-generator";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Partial<AssessmentInput>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const input: AssessmentInput = { gradeLevel: typeof body.gradeLevel === "string" ? body.gradeLevel : "", subject: typeof body.subject === "string" ? body.subject : "", topic: typeof body.topic === "string" ? body.topic : "", learningCompetency: typeof body.learningCompetency === "string" ? body.learningCompetency : "", itemCount: Number(body.itemCount), types: Array.isArray(body.types) ? body.types.filter((v): v is string => typeof v === "string") : [], difficulty: typeof body.difficulty === "string" ? body.difficulty : "Moderate" };
  const errors = validateAssessmentInput(input);
  if (errors.length) return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  const provider = getAIProvider();
  if (!provider) return NextResponse.json({ error: "AI generation is not configured." }, { status: 503 });
  try {
    const draft = await provider.generateText({ system: "You are CoTeacher. Generate practical, age-appropriate assessment drafts. Never fabricate official curriculum requirements or learner facts. Keep the answer key consistent with the generated items.", user: buildAssessmentPrompt(input) });
    return NextResponse.json({ draft });
  } catch { return NextResponse.json({ error: "The AI provider could not generate the assessment." }, { status: 502 }); }
}
