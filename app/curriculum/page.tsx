"use client";

import { useState } from "react";
import CurriculumActions from "./CurriculumActions";

type Result = { id: string; gradeLevel: string; learningArea: string; quarter?: string; competency: string; source: string; sourceUrl?: string; verified: boolean };

export default function CurriculumPage() {
  const [q, setQ] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [learningArea, setLearningArea] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchCurriculum() {
    setLoading(true);
    setStatus("Searching verified curriculum records...");
    const params = new URLSearchParams({ q, gradeLevel, learningArea });
    const response = await fetch(`/api/curriculum/search?${params}`);
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setStatus(data.error || "Unable to search curriculum.");
      return;
    }
    setResults(data.results || []);
    setStatus((data.results || []).length ? `${data.results.length} verified record(s) found.` : "No verified curriculum records found.");
  }

  return (
    <main className="main">
      <div className="header"><div><div className="eyebrow">Curriculum Knowledge</div><h1>Find verified learning competencies.</h1><p className="subtitle">CoTeacher searches verified curriculum records only. AI-generated text is never treated as an official curriculum source.</p></div></div>
      <section className="card"><div className="profile-form compact-form">
        <label>Search competency<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. fractions" /></label>
        <label>Grade level<input value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="e.g. Grade 7" /></label>
        <label>Learning area<input value={learningArea} onChange={(e) => setLearningArea(e.target.value)} placeholder="e.g. Mathematics" /></label>
        <button className="primary-button" onClick={searchCurriculum} disabled={loading}>{loading ? "Searching..." : "Search verified curriculum"}</button>
        {status && <p className="form-status" role="status">{status}</p>}
      </div></section>
      <section className="card"><div className="card-title"><h2>Verified results</h2><span className="stat-label">Verified sources only</span></div>
        {results.length ? results.map((item) => <article className="task-card" key={item.id}><div><strong>{item.competency}</strong><p>{item.gradeLevel} · {item.learningArea}{item.quarter ? ` · ${item.quarter}` : ""}</p><small>Source: {item.source}</small><CurriculumActions curriculumId={item.id} /></div></article>) : <div className="empty-state"><h3>No curriculum records to display</h3><p>Until verified curriculum documents are ingested and reviewed, CoTeacher will not invent or present competencies as official.</p></div>}
      </section>
    </main>
  );
}
