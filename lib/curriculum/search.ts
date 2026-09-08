import type { CurriculumItem, CurriculumSearchResult } from "./types";

export function searchCurriculum(items: CurriculumItem[], query: string, filters?: { gradeLevel?: string; learningArea?: string }) {
  const normalized = query.trim().toLowerCase();
  return items
    .filter((item) => item.verified)
    .filter((item) => !filters?.gradeLevel || item.gradeLevel === filters.gradeLevel)
    .filter((item) => !filters?.learningArea || item.learningArea === filters.learningArea)
    .map((item): CurriculumSearchResult => ({ ...item, relevance: normalized ? [item.competency, item.learningArea, item.gradeLevel].join(" ").toLowerCase().includes(normalized) ? 1 : 0 : 0 }))
    .filter((item) => !normalized || (item.relevance ?? 0) > 0)
    .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
}
