export const CURRICULUM_SOURCE_POLICY = {
  allowedSources: ["official DepEd publications", "official DepEd learning resources", "school-provided verified curriculum files"],
  requireVerified: true,
  allowAiInferenceAsSource: false,
  note: "AI may summarize or organize verified curriculum content, but must not invent competencies, codes, or official wording.",
} as const;
