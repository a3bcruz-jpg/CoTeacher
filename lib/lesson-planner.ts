export type LessonPlanInput = {
  gradeLevel: string;
  subject: string;
  topic: string;
  learningCompetency: string;
  durationMinutes: number;
  learnerContext?: string;
};

export function validateLessonPlanInput(input: LessonPlanInput) {
  const errors: string[] = [];
  if (!input.gradeLevel.trim()) errors.push("Grade level is required.");
  if (!input.subject.trim()) errors.push("Subject is required.");
  if (!input.topic.trim()) errors.push("Topic is required.");
  if (!input.learningCompetency.trim()) errors.push("Learning competency is required.");
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes < 15 || input.durationMinutes > 480) errors.push("Duration must be between 15 and 480 minutes.");
  return errors;
}

export function buildLessonPlanPrompt(input: LessonPlanInput) {
  return `You are CoTeacher, an administrative and instructional writing assistant for Philippine teachers. Create a structured lesson-plan draft using ONLY the teacher-provided information below. Do not invent curriculum codes, official DepEd wording, policies, learner data, or factual claims. If a detail is not supplied, mark it as [To be completed]. Treat the output as a teacher-reviewable draft, not an official DepEd template.\n\nGrade level: ${input.gradeLevel}\nSubject: ${input.subject}\nTopic: ${input.topic}\nLearning competency/objective: ${input.learningCompetency}\nDuration: ${input.durationMinutes} minutes\nLearner context: ${input.learnerContext?.trim() || "[Not provided]"}\n\nStructure the draft with: Learning Objective, Materials, Introduction/Motivation, Lesson Development, Guided Practice, Independent Practice, Assessment, Differentiation/Support, and Assignment/Next Step. Keep activities realistic for the stated duration.`;
}
