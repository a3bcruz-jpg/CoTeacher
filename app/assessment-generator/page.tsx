"use client";

import { useEffect, useState } from "react";

const TYPES = ["Multiple Choice", "True / False", "Short Answer"];

export default function AssessmentGeneratorPage() {
  const [form, setForm] = useState({ gradeLevel:"", subject:"", topic:"", learningCompetency:"", itemCount:10, difficulty:"Moderate", types:["Multiple Choice"] });
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [curriculumId, setCurriculumId] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("curriculumId");
    if (!id) return;
    setCurriculumId(id);
    setStatus("Loading verified curriculum context...");
    fetch(`/api/curriculum/${encodeURIComponent(id)}`)
      .then(async (response) => ({ response, data: await response.json().catch(() => ({})) }))
      .then(({ response, data }) => {
        if (!response.ok) { setStatus(data.error || "Verified curriculum record could not be loaded."); return; }
        const item = data.curriculum;
        setForm((current) => ({ ...current, gradeLevel: item.gradeLevel || current.gradeLevel, subject: item.learningArea || current.subject, learningCompetency: item.competency || current.learningCompetency }));
        setStatus(`Verified curriculum context loaded from ${item.source}. Review it before generating.`);
      })
      .catch(() => setStatus("Unable to load verified curriculum context."));
  }, []);

  function toggleType(type:string) { setForm(v => ({...v, types:v.types.includes(type) ? v.types.filter(x=>x!==type) : [...v.types,type]})); }
  async function generate() {
    setLoading(true); setStatus("Generating assessment draft...");
    const response = await fetch("/api/assessment-generator", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...form, curriculumId: curriculumId || undefined }) });
    const data = await response.json().catch(()=>({}));
    setLoading(false);
    if (!response.ok) { setStatus(data.error || "Unable to generate assessment."); return; }
    setDraft(data.draft || ""); setStatus("Draft ready. Review every item and answer before use.");
  }
  return <main className="main"><div className="header"><div><div className="eyebrow">Assessment Generator</div><h1>Create assessments faster.</h1><p className="subtitle">Generate a teacher-reviewable assessment from your lesson context, item count, and preferred question types.</p></div></div><section className="ai-workspace"><div className="card"><div className="card-title"><h2>Assessment context</h2>{curriculumId&&<span className="stat-label">Verified curriculum linked</span>}</div><div className="profile-form compact-form"><label>Grade level *<input value={form.gradeLevel} onChange={e=>setForm({...form,gradeLevel:e.target.value})} placeholder="e.g. Grade 7"/></label><label>Subject *<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Science"/></label><label>Topic *<input value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="Topic covered"/></label><label>Learning competency / objective *<textarea rows={3} value={form.learningCompetency} onChange={e=>setForm({...form,learningCompetency:e.target.value})} placeholder="Use the competency/objective from your verified source"/></label><label>Number of items *<input type="number" min={1} max={50} value={form.itemCount} onChange={e=>setForm({...form,itemCount:Number(e.target.value)})}/></label><label>Difficulty<select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}><option>Easy</option><option>Moderate</option><option>Challenging</option></select></label><fieldset><legend>Question types *</legend>{TYPES.map(type=><label className="checkbox-row" key={type}><input type="checkbox" checked={form.types.includes(type)} onChange={()=>toggleType(type)}/>{type}</label>)}</fieldset><button className="primary-button" onClick={generate} disabled={loading}>{loading?"Generating...":"Generate assessment"}</button>{status&&<p className="form-status" role="status">{status}</p>}</div></div><div className="card"><div className="card-title"><h2>Review assessment</h2></div>{draft?<><textarea className="draft-editor" rows={30} value={draft} onChange={e=>setDraft(e.target.value)}/><p className="disclaimer">AI-generated assessments are drafts. Verify item accuracy, difficulty, answer keys, competency alignment, and school requirements before classroom use.</p></>:<div className="empty-state"><h3>Your assessment will appear here</h3><p>Complete the context and generate a draft.</p></div>}</div></section></main>;
}
