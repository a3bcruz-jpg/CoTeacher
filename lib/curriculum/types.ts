export type CurriculumItem = {
  id: string;
  gradeLevel: string;
  learningArea: string;
  quarter?: string;
  competency: string;
  source: string;
  sourceUrl?: string;
  verified: boolean;
};

export type CurriculumSearchResult = CurriculumItem & { relevance?: number };
