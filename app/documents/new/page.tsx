"use client";
import { FormEvent, useState } from "react";

export default function NewDocumentPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setStatus("Saving..."); const response = await fetch("/api/documents", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({title,content}) }); const data=await response.json().catch(()=>({})); if(!response.ok){setStatus(data.error||"Unable to save document.");return;} window.location.href="/documents"; }
  return <main className="onboarding-shell"><section className="onboarding-card"><div className="eyebrow">Document workspace</div><h1>Create a document.</h1><p className="subtitle">Start with a draft. AI assistance and reusable templates will build on this workspace.</p><form className="profile-form" onSubmit={submit}><label>Title<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Narrative Report" /></label><label>Content<textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Start writing..." rows={12} /></label><button className="primary-button full-width" type="submit">Save draft</button>{status&&<p className="form-status" role="status">{status}</p>}</form></section></main>;
}
