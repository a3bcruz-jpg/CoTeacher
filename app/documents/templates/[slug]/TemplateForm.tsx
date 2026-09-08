"use client";
import { FormEvent, useState } from "react";
import type { DocumentTemplate } from "@/lib/document-templates";

export default function TemplateForm({ template }: { template: DocumentTemplate }) {
  const [values, setValues] = useState<Record<string,string>>({});
  const [status, setStatus] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const missing=template.fields.find(f=>f.required&&!values[f.key]?.trim()); if(missing){setStatus(`Please complete: ${missing.label}.`);return;} setStatus("Saving draft..."); const content=template.fields.map(f=>`${f.label}: ${values[f.key]||""}`).join("\n\n"); const response=await fetch("/api/documents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:template.name,content})}); const data=await response.json().catch(()=>({})); if(!response.ok){setStatus(data.error||"Unable to save draft.");return;} window.location.href="/documents"; }
  return <form className="profile-form" onSubmit={submit}>{template.fields.map(field=><label key={field.key}>{field.label}{field.required&&<span aria-hidden="true"> *</span>}<textarea required={field.required} rows={field.key.length>10?4:3} value={values[field.key]||""} onChange={e=>setValues(v=>({...v,[field.key]:e.target.value}))} placeholder={field.placeholder}/></label>)}<button className="primary-button full-width" type="submit">Create draft</button>{status&&<p className="form-status" role="status">{status}</p>}</form>;
}
