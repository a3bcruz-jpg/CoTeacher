import type { CurriculumItem } from "./types";

export function buildVerifiedCurriculumContext(item: CurriculumItem) {
  if (!item.verified) throw new Error("Only verified curriculum records may be used as authoritative context.");
  return `Verified curriculum context:\nGrade level: ${item.gradeLevel}\nLearning area: ${item.learningArea}\n${item.quarter ? `Quarter: ${item.quarter}\n` : ""}Competency: ${item.competency}\nSource: ${item.source}${item.sourceUrl ? `\nSource URL: ${item.sourceUrl}` : ""}`;
}
