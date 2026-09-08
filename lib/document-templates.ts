export type DocumentTemplateField = { key: string; label: string; required?: boolean; placeholder?: string };

export type DocumentTemplate = {
  slug: string;
  name: string;
  description: string;
  category: string;
  version: number;
  fields: DocumentTemplateField[];
};

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    slug: "narrative-report",
    name: "Narrative Report",
    description: "Turn structured activity notes into a professional narrative report draft.",
    category: "Reports",
    version: 1,
    fields: [
      { key: "activity", label: "Activity", required: true, placeholder: "School activity or event" },
      { key: "date", label: "Date", required: true, placeholder: "September 8, 2026" },
      { key: "objective", label: "Objective", required: true, placeholder: "What was the activity intended to accomplish?" },
      { key: "highlights", label: "Highlights", required: true, placeholder: "Key events, participation, and outcomes" },
      { key: "nextSteps", label: "Next steps", placeholder: "Follow-up actions or recommendations" },
    ],
  },
  {
    slug: "activity-plan",
    name: "Activity Plan",
    description: "Create a structured starting point for a classroom or school activity.",
    category: "Planning",
    version: 1,
    fields: [
      { key: "title", label: "Activity title", required: true, placeholder: "Activity name" },
      { key: "objective", label: "Objective", required: true, placeholder: "Learning or activity objective" },
      { key: "participants", label: "Participants", required: true, placeholder: "Grade, section, or group" },
      { key: "materials", label: "Materials", placeholder: "Materials or resources" },
      { key: "steps", label: "Steps", required: true, placeholder: "Describe the activity flow" },
    ],
  },
];

export function getDocumentTemplate(slug: string) {
  return DOCUMENT_TEMPLATES.find((template) => template.slug === slug);
}
