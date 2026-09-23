export type AssessmentInput = {
  gradeLevel: string;
  subject: string;
  topic: string;
  learningCompetency: string;
  itemCount: number;
  types: string[];
  difficulty: string;
};

export function validateAssessmentInput(input: AssessmentInput) {
  const errors: string[] = [];
  if (!input.gradeLevel.trim()) errors.push("Grade level is required.");
  if (!input.subject.trim()) errors.push("Subject is required.");
  if (!input.topic.trim()) errors.push("Topic is required.");
  if (!input.learningCompetency.trim()) errors.push("Learning competency/objective is required.");
  if (input.gradeLevel.length > 100) errors.push("Grade level is too long.");
  if (input.subject.length > 150) errors.push("Subject is too long.");
  if (input.topic.length > 300) errors.push("Topic is too long.");
  if (input.learningCompetency.length > 2_000) errors.push("Learning competency/objective is too long.");
  if (input.difficulty.length > 50) errors.push("Difficulty is too long.");
  if (!Number.isInteger(input.itemCount) || input.itemCount < 1 || input.itemCount > 50) errors.push("Item count must be between 1 and 50.");
  if (!input.types.length) errors.push("At least one assessment type is required.");
  if (input.types.length > 10 || input.types.some((type) => type.length > 80)) errors.push("Assessment types are invalid.");
  return errors;
}

export function buildAssessmentPrompt(input: AssessmentInput) {
  return `You are CoTeacher, an assessment-writing assistant for Philippine teachers. Create a reviewable assessment draft using ONLY the teacher-provided information. Never invent curriculum codes, official DepEd wording, learner facts, or unsupported claims. Do not claim alignment unless the supplied competency supports it.\\n\\nGrade level: ${input.gradeLevel}\\nSubject: ${input.subject}\\nTopic: ${input.topic}\\nLearning competency/objective: ${input.learningCompetency}\\nNumber of items: ${input.itemCount}\\nAssessment types: ${input.types.join(", ")}\\nDifficulty: ${input.difficulty}\\n\\nReturn: title, brief instructions, numbered items, answer key, and a short teacher review note. Keep the item difficulty appropriate to the stated grade level and objective. If information is insufficient, mark it [To be completed] rather than guessing.`;
}
