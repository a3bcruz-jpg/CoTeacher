"use client";

import { useState } from "react";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

export default function DocumentAssistantPage() {
  const [templateSlug, setTemplateSlug] = useState(DOCUMENT_TEMPLATES[0].slug);
  const [fields, setFields] = useState<Record<string,string>>({});
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const template = DOCUMENT_TEMPLATES.find((item) => item.slug === templateSlug) ?? DOCUMENT_TEMPLATES[0];
  function selectTemplate(slug: string) { setTemplateSlug(slug); setFields({}); setDraft(""); setStatus(""); }
  async function generate() {
    setStatus("Preparing draft...");
    const response = await fetch("/api/ai/document-assistant", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ templateSlug, fields }) });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) { setStatus(data.error || "Unable to prepare draft."); return; }
    setDraft(data.draft); setStatus("Draft ready. Review before using or submitting.");
  }
  return <main className="main"><div className="header"><div><div className="eyebrow">AI Document Assistant</div><h1>Turn notes into a structured draft.</h1><p className="subtitle">CoTeacher helps organize teacher-provided information. It does not replace review of official requirements.</p></div></div><section className="ai-workspace"><div className="card"><div className="card-title"><h2>1. Choose a template</h2></div><div className="template-picker">{DOCUMENT_TEMPLATES.map(item=><button key={item.slug} className={item.slug===templateSlug?"template-option selected":"template-option"} onClick={()=>selectTemplate(item.slug)}><strong>{item.name}</strong><span>{item.category}</span></button>)}</div></div><div className="card"><div className="card-title"><h2>2. Provide information</h2><span className="stat-label">{template.name}</span></div><div className="profile-form compact-form">{template.fields.map(field=><label key={field.key}>{field.label}{field.required&&" *"}<textarea rows={3} required={field.required} value={fields[field.key]||""} onChange={e=>setFields(v=>({...v,[field.key]:e.target.value}))} placeholder={field.placeholder}/></label>)}<button className="primary-button" onClick={generate}>Prepare draft</button>{status&&<p className="form-status" role="status">{status}</p>}</div></div><div className="card"><div className="card-title"><h2>3. Review draft</h2></div>{draft?<><textarea className="draft-editor" value={draft} onChange={e=>setDraft(e.target.value)} rows={20}/><p className="disclaimer">Review every generated section for accuracy. Verify current DepEd or school requirements before official use or submission.</p></>:<div className="empty-state"><h3>Your draft will appear here</h3><p>Complete the required information, then prepare the draft.</p></div>}</div></section></main>;
}
