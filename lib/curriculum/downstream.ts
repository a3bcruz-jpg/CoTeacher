import type { CurriculumItem } from "./types";
import { buildVerifiedCurriculumContext } from "./context";

export function getVerifiedDownstreamContext(items: CurriculumItem[], curriculumId?: string) {
  if (!curriculumId) return null;
  const item = items.find((candidate) => candidate.id === curriculumId && candidate.verified);
  return item ? buildVerifiedCurriculumContext(item) : null;
}

export function toLessonPlannerFields(context: ReturnType<typeof buildVerifiedCurriculumContext>) {
  return { gradeLevel: context.gradeLevel, subject: context.learningArea, learningCompetency: context.competency };
}

export function toAssessmentFields(context: ReturnType<typeof buildVerifiedCurriculumContext>) {
  return { gradeLevel: context.gradeLevel, subject: context.learningArea, learningCompetency: context.competency };
}
