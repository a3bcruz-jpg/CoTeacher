import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

// Selection endpoint is intentionally a validation boundary. The verified dataset
// must be supplied by the approved curriculum repository before records are exposed.
const VERIFIED_CURRICULUM: Array<{ id:string; gradeLevel:string; learningArea:string; quarter?:string; competency:string; source:string; sourceUrl?:string; verified:boolean }> = [];

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Curriculum ID is required." }, { status: 400 });
  const item = VERIFIED_CURRICULUM.find((candidate) => candidate.id === id && candidate.verified);
  if (!item) return NextResponse.json({ error: "Verified curriculum record not found." }, { status: 404 });
  return NextResponse.json({ curriculum: item });
}
