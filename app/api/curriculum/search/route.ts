import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { searchCurriculum } from "@/lib/curriculum/search";

// Data ingestion is intentionally separate. Until verified curriculum records are imported,
// the endpoint returns an empty result instead of inventing official curriculum content.
const VERIFIED_CURRICULUM: never[] = [];

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const results = searchCurriculum(VERIFIED_CURRICULUM, params.get("q") || "", { gradeLevel: params.get("gradeLevel") || undefined, learningArea: params.get("learningArea") || undefined });
  return NextResponse.json({ results, sourcePolicy: "verified-only" });
}
