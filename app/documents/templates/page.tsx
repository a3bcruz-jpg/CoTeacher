import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

export default async function DocumentTemplatesPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  return <main className="main"><div className="header"><div><div className="eyebrow">Templates</div><h1>Start from a template.</h1><p className="subtitle">Choose a structured starting point. Official requirements should always be verified before submission.</p></div></div><section className="template-grid">{DOCUMENT_TEMPLATES.map((template)=><article className="card template-card" key={template.slug}><div className="eyebrow">{template.category}</div><h2>{template.name}</h2><p className="subtitle">{template.description}</p><div className="template-meta">Version {template.version} · {template.fields.length} fields</div><Link className="primary-button" href={`/documents/templates/${template.slug}`}>Use template</Link></article>)}</section></main>;
}
