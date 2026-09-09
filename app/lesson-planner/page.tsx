"use client";

import { useState } from "react";

export default function LessonPlannerPage() {
  const [form, setForm] = useState({ gradeLevel:"", subject:"", topic:"", learningCompetency:"", durationMinutes:60, learnerContext:"" });
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function generate() {
    setLoading(true); setStatus("Generating lesson-plan draft...");
    const response = await fetch("/api/lesson-planner", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const data = await response.json().catch(()=>({}));
    setLoading(false);
    if (!response.ok) { setStatus(data.error || "Unable to generate lesson plan."); return; }
    setDraft(data.draft || ""); setStatus("Draft ready. Review all content before classroom use.");
  }
  return <main className="main"><div className="header"><div><div className="eyebrow">Lesson Planning Assistant</div><h1>Plan a lesson with less paperwork.</h1><p className="subtitle">Give CoTeacher the teaching context, then review the generated lesson-plan draft.</p></div></div><section className="ai-workspace"><div className="card"><div className="card-title"><h2>Lesson context</h2></div><div className="profile-form compact-form"><label>Grade level *<input value={form.gradeLevel} onChange={e=>setForm({...form,gradeLevel:e.target.value})} placeholder="e.g. Grade 7"/></label><label>Subject *<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Mathematics"/></label><label>Topic *<input value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="Lesson topic"/></label><label>Learning competency / objective *<textarea rows={3} value={form.learningCompetency} onChange={e=>setForm({...form,learningCompetency:e.target.value})} placeholder="Enter the competency or objective provided by your school/curriculum source"/></label><label>Duration (minutes) *<input type="number" min={15} max={480} value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}/></label><label>Learner context<textarea rows={3} value={form.learnerContext} onChange={e=>setForm({...form,learnerContext:e.target.value})} placeholder="Optional: class needs, prior knowledge, available resources"/></label><button className="primary-button" onClick={generate} disabled={loading}>{loading?"Generating...":"Generate lesson plan"}</button>{status&&<p className="form-status" role="status">{status}</p>}</div></div><div className="card"><div className="card-title"><h2>Review draft</h2></div>{draft?<><textarea className="draft-editor" rows={28} value={draft} onChange={e=>setDraft(e.target.value)}/><p className="disclaimer">AI-generated instructional content is a draft. Verify competencies, curriculum alignment, timing, learner needs, and applicable school or DepEd requirements before use.</p></>:<div className="empty-state"><h3>Your lesson plan will appear here</h3><p>Complete the lesson context and generate a draft.</p></div>}</div></section></main>;
}
