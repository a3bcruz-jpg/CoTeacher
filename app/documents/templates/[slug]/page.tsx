import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDocumentTemplate } from "@/lib/document-templates";
import TemplateForm from "./TemplateForm";

export default async function TemplatePage({ params }: { params: { slug: string } }) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const template = getDocumentTemplate(params.slug);
  if (!template) notFound();
  return <main className="onboarding-shell"><section className="onboarding-card"><div className="eyebrow">{template.category} · v{template.version}</div><h1>{template.name}</h1><p className="subtitle">{template.description} This creates a draft only and does not represent an official DepEd form.</p><TemplateForm template={template} /></section></main>;
}
