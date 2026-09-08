import type { CurriculumItem } from "./types";

export function buildVerifiedCurriculumContext(item: CurriculumItem) {
  if (!item.verified) throw new Error("Only verified curriculum records can be used as authoritative context.");
  return {
    curriculumId: item.id,
    gradeLevel: item.gradeLevel,
    learningArea: item.learningArea,
    quarter: item.quarter ?? null,
    competency: item.competency,
    source: item.source,
    sourceUrl: item.sourceUrl ?? null,
  };
}

export function curriculumContextInstruction(context: ReturnType<typeof buildVerifiedCurriculumContext>) {
  return `Use the following VERIFIED curriculum context as reference. Preserve the competency wording and do not invent or replace official curriculum information. Source: ${context.source}${context.sourceUrl ? ` (${context.sourceUrl})` : ""}. Grade: ${context.gradeLevel}. Learning Area: ${context.learningArea}. Quarter: ${context.quarter ?? "Not specified"}. Competency: ${context.competency}`;
}
