import type { CurriculumItem } from "./types";
import { buildVerifiedCurriculumContext } from "./context";

export function resolveVerifiedCurriculum(items: CurriculumItem[], curriculumId?: string) {
  if (!curriculumId) return null;
  const item = items.find((candidate) => candidate.id === curriculumId);
  if (!item || !item.verified) return null;
  return buildVerifiedCurriculumContext(item);
}

export function mergeLessonPlannerContext(base: { gradeLevel: string; subject: string; topic: string; learningCompetency: string; durationMinutes: number; learnerContext?: string }, curriculum: ReturnType<typeof buildVerifiedCurriculumContext> | null) {
  if (!curriculum) return base;
  return { ...base, gradeLevel: curriculum.gradeLevel || base.gradeLevel, subject: curriculum.learningArea || base.subject, learningCompetency: curriculum.competency };
}

export function buildDownstreamWorkflowContext(curriculum: ReturnType<typeof buildVerifiedCurriculumContext>) {
  return {
    curriculumId: curriculum.curriculumId,
    gradeLevel: curriculum.gradeLevel,
    learningArea: curriculum.learningArea,
    quarter: curriculum.quarter,
    competency: curriculum.competency,
    source: curriculum.source,
    sourceUrl: curriculum.sourceUrl,
  };
}
