import { getDocumentTemplate } from "@/lib/document-templates";

export type DocumentAssistantInput = {
  templateSlug: string;
  fields: Record<string, string>;
  teacherName?: string;
  schoolName?: string;
};

export function buildDocumentPrompt(input: DocumentAssistantInput) {
  const template = getDocumentTemplate(input.templateSlug);
  if (!template) throw new Error("Unknown document template.");

  const missing = template.fields.filter((field) => field.required && !input.fields[field.key]?.trim());
  if (missing.length) throw new Error(`Missing required fields: ${missing.map((field) => field.label).join(", ")}.`);

  const context = [input.teacherName && `Teacher: ${input.teacherName}`, input.schoolName && `School: ${input.schoolName}`].filter(Boolean).join("\n");
  const source = template.fields.map((field) => `${field.label}: ${input.fields[field.key] || ""}`).join("\n");

  return `You are CoTeacher, an administrative writing assistant for Philippine teachers.\n\nCreate a clear, professional draft based ONLY on the information supplied below. Do not invent names, dates, accomplishments, statistics, policies, or official requirements. If information is missing, use a neutral placeholder or state that the teacher should complete it. Preserve factual meaning. Do not claim that the output is an official DepEd form or policy document.\n\n${context}\n\nTemplate: ${template.name} (version ${template.version})\n\nSource information:\n${source}\n\nReturn only the polished draft.`;
}

export function createLocalDraft(input: DocumentAssistantInput) {
  const template = getDocumentTemplate(input.templateSlug);
  if (!template) throw new Error("Unknown document template.");
  const prompt = buildDocumentPrompt(input);
  const sections = template.fields.map((field) => `${field.label}\n${input.fields[field.key] || "[Complete this section]"}`).join("\n\n");
  return { prompt, draft: sections };
}
