"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";

export default function LessonPlannerPage() {
  const router = useRouter();
  const [form, setForm] = useState({ gradeLevel:"", subject:"", topic:"", learningCompetency:"", durationMinutes:60, learnerContext:"" });
  const [draft, setDraft] = useState(""); const [generationId, setGenerationId] = useState(""); const [status, setStatus] = useState(""); const [loading, setLoading] = useState(false); const [saving, setSaving] = useState(false); const [curriculumId, setCurriculumId] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("curriculumId"); if (!id) return;
    setCurriculumId(id); setStatus("Loading verified curriculum context...");
    fetch(`/api/curriculum/${encodeURIComponent(id)}`).then(async (response) => ({ response, data: await response.json().catch(() => ({})) })).then(({ response, data }) => {
      if (!response.ok) { setStatus(data.error || "Verified curriculum record could not be loaded."); return; }
      const item = data.curriculum;
      setForm((current) => ({ ...current, gradeLevel:item.gradeLevel || current.gradeLevel, subject:item.learningArea || current.subject, learningCompetency:item.competency || current.learningCompetency }));
      setStatus(`Verified curriculum context loaded from ${item.source}. Review it before generating.`);
    }).catch(() => setStatus("Unable to load verified curriculum context."));
  }, []);

  const canGenerate = !loading && !!form.gradeLevel.trim() && !!form.subject.trim() && !!form.topic.trim() && !!form.learningCompetency.trim() && Number.isInteger(form.durationMinutes) && form.durationMinutes >= 15 && form.durationMinutes <= 480;

  async function generate() {
    if (!canGenerate) { setStatus("Complete the required lesson context and use a duration from 15 to 480 minutes."); return; }
    setLoading(true); setStatus("Building your lesson plan...");
    try {
      const response = await fetch("/api/lesson-planner", { method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body:JSON.stringify({ ...form, curriculumId:curriculumId || undefined }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setStatus(data.error || "Unable to generate lesson plan."); return; }
      setDraft(data.draft || ""); setGenerationId(data.generationId || ""); setStatus("Draft ready. Review all content before classroom use.");
    } catch { setStatus("Unable to reach the lesson-planning service."); } finally { setLoading(false); }
  }

  async function saveDraft() {
    if (!draft.trim() || saving) return;
    setSaving(true); setStatus("Saving lesson plan to Documents...");
    try {
      const title = form.topic.trim() ? `Lesson Plan: ${form.topic.trim()}` : "Lesson Plan Draft";
      const response = await fetch("/api/documents", { method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body:JSON.stringify({ title, content:draft, generationId:generationId || undefined }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setStatus(data.error || "Unable to save lesson plan."); return; }
      router.push(`/documents/${encodeURIComponent(data.document.id)}`);
    } catch { setStatus("Unable to reach Documents. Please try again."); } finally { setSaving(false); }
  }

  return <AppShell active="/lesson-planner"><main className="page-shell">
    <header className="page-header"><div><div className="eyebrow">Guided workflow</div><h1>Plan a lesson with less paperwork.</h1><p className="subtitle">Give CoTeacher the teaching context, then review and refine the draft.</p></div></header>
    <section className="ai-workspace">
      <div className="card"><div className="card-title"><div><div className="eyebrow">Step 1</div><h2>Lesson context</h2></div>{curriculumId && <span className="status-chip status-final">Verified curriculum</span>}</div>
        <div className="profile-form compact-form">
          <label>Grade level *<input value={form.gradeLevel} onChange={e=>setForm({...form,gradeLevel:e.target.value})} placeholder="e.g. Grade 7" maxLength={100}/></label>
          <label>Subject *<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Mathematics" maxLength={120}/></label>
          <label>Topic *<input value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="What are you teaching?" maxLength={240}/></label>
          <label>Learning competency / objective *<textarea rows={4} value={form.learningCompetency} onChange={e=>setForm({...form,learningCompetency:e.target.value})} placeholder="Use the competency or objective provided by your school or curriculum source." maxLength={3000}/></label>
          <div className="form-grid"><label>Duration (minutes) *<input type="number" min={15} max={480} value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}/></label><label>Learner context<textarea rows={2} value={form.learnerContext} onChange={e=>setForm({...form,learnerContext:e.target.value})} placeholder="Optional class needs, prior knowledge, resources" maxLength={3000}/></label></div>
          <button className="primary-button" onClick={generate} disabled={!canGenerate}>{loading ? "Building your lesson plan..." : "Generate lesson plan →"}</button>
          {status && <p className="form-status" role="status" aria-live="polite">{status}</p>}
        </div>
      </div>
      <div className="card"><div className="card-title"><div><div className="eyebrow">Step 2</div><h2>Review your draft</h2></div>{draft && <button className="secondary-button" onClick={saveDraft} disabled={saving}>{saving ? "Saving..." : "Save to Documents"}</button>}</div>
        {draft ? <><textarea className="draft-editor" rows={28} value={draft} onChange={e=>setDraft(e.target.value)} aria-label="Lesson plan draft"/><p className="disclaimer">AI-generated instructional content is a draft. Verify competencies, curriculum alignment, timing, learner needs, and applicable school or DepEd requirements before use.</p></> : <div className="empty-state"><h3>Your draft will appear here</h3><p>Complete the lesson context, then generate a plan you can review and edit.</p></div>}
      </div>
    </section>
  </main></AppShell>;
}
