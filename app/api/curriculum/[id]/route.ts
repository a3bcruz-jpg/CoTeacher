import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { VERIFIED_CURRICULUM } from "@/lib/curriculum/verified";
import { buildVerifiedCurriculumContext } from "@/lib/curriculum/selection";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = VERIFIED_CURRICULUM.find((candidate) => candidate.id === params.id);
  if (!item || !item.verified) return NextResponse.json({ error: "Verified curriculum record not found." }, { status: 404 });

  return NextResponse.json({
    curriculum: item,
    context: buildVerifiedCurriculumContext(item),
  });
}
