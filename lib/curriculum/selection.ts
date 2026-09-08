import type { CurriculumItem } from "./types";
import { buildVerifiedCurriculumContext } from "./context";

export function selectVerifiedCurriculum(items: CurriculumItem[], id: string) {
  const item = items.find((candidate) => candidate.id === id && candidate.verified);
  if (!item) return null;
  return buildVerifiedCurriculumContext(item);
}
