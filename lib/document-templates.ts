export type DocumentTemplateField = {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
};

export type DocumentTemplate = {
  slug: string;
  name: string;
  category: string;
  version: string;
  fields: DocumentTemplateField[];
};

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    slug: "accomplishment-report",
    name: "Accomplishment Report",
    category: "Reports",
    version: "1.0",
    fields: [
      { key: "period", label: "Reporting period", placeholder: "Example: August 2026", required: true },
      { key: "activities", label: "Activities completed", placeholder: "List the activities, tasks, or programs completed.", required: true },
      { key: "results", label: "Results or accomplishments", placeholder: "Describe measurable or observable results. Include only verified information.", required: true },
      { key: "challenges", label: "Challenges encountered", placeholder: "Describe relevant challenges, if any." },
      { key: "nextSteps", label: "Next steps", placeholder: "Describe planned follow-up actions." },
    ],
  },
  {
    slug: "activity-report",
    name: "Activity Report",
    category: "Reports",
    version: "1.0",
    fields: [
      { key: "activity", label: "Activity title", placeholder: "Name of the activity", required: true },
      { key: "date", label: "Date and venue", placeholder: "Provide the date and venue.", required: true },
      { key: "participants", label: "Participants", placeholder: "Describe who participated and the number, if verified." },
      { key: "objectives", label: "Objectives", placeholder: "State the objectives of the activity.", required: true },
      { key: "outcomes", label: "Outcomes", placeholder: "Describe what happened and the verified outcomes.", required: true },
      { key: "recommendations", label: "Recommendations", placeholder: "Add recommendations or follow-up actions." },
    ],
  },
  {
    slug: "memorandum",
    name: "Memorandum Draft",
    category: "Communication",
    version: "1.0",
    fields: [
      { key: "to", label: "To", placeholder: "Recipient or intended audience", required: true },
      { key: "subject", label: "Subject", placeholder: "Memorandum subject", required: true },
      { key: "purpose", label: "Purpose", placeholder: "Explain why the memorandum is being issued.", required: true },
      { key: "details", label: "Details", placeholder: "Provide the facts, instructions, dates, and other relevant details." , required: true },
      { key: "action", label: "Requested action", placeholder: "State any action expected from the recipient." },
    ],
  },
  {
    slug: "parent-letter",
    name: "Parent/Guardian Letter",
    category: "Communication",
    version: "1.0",
    fields: [
      { key: "purpose", label: "Purpose of the letter", placeholder: "Explain the reason for contacting the parent or guardian.", required: true },
      { key: "studentContext", label: "Student context", placeholder: "Provide only necessary, verified information about the student.", required: true },
      { key: "details", label: "Important details", placeholder: "Describe the relevant facts, dates, or circumstances.", required: true },
      { key: "requestedSupport", label: "Requested support or action", placeholder: "Describe any requested response or support." },
      { key: "contactDetails", label: "Contact details", placeholder: "Provide school-approved contact information, if applicable." },
    ],
  },
];

export function getDocumentTemplate(slug: string) {
  return DOCUMENT_TEMPLATES.find((template) => template.slug === slug);
}
