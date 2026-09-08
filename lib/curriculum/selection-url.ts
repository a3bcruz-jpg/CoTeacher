export function buildLessonPlannerUrl(context: { curriculumId: string }) {
  const params = new URLSearchParams({ curriculumId: context.curriculumId });
  return `/lesson-planner?${params.toString()}`;
}

export function buildAssessmentGeneratorUrl(context: { curriculumId: string }) {
  const params = new URLSearchParams({ curriculumId: context.curriculumId });
  return `/assessment-generator?${params.toString()}`;
}
