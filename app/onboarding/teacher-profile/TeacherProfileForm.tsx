"use client";

import { FormEvent, useState } from "react";

type Profile = {
  fullName?: string;
  position?: string | null;
  gradeLevel?: string | null;
  department?: string | null;
  schoolYear?: string | null;
  school?: { name?: string } | null;
  classes?: { subjects?: { name: string }[] }[];
};

export default function TeacherProfileForm({ profile }: { profile: Profile | null }) {
  const initialSubject = profile?.classes?.[0]?.subjects?.[0]?.name ?? "";
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ fullName: profile?.fullName ?? "", position: profile?.position ?? "", school: profile?.school?.name ?? "", gradeLevel: profile?.gradeLevel ?? "", subject: initialSubject, department: profile?.department ?? "", schoolYear: profile?.schoolYear ?? "2026-2027" });
  function update(key: keyof typeof form, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setStatus("Saving...");
    try {
      const response = await fetch("/api/teacher-profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setStatus(data.error || "Unable to save your profile."); return; }
      setStatus("Profile saved. Redirecting..."); window.location.href = "/";
    } catch { setStatus("Unable to reach CoTeacher. Please try again."); }
  }
  return <form className="profile-form" onSubmit={submit}>
    <label>Full name<input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" /></label>
    <label>Position<input value={form.position} onChange={(e) => update("position", e.target.value)} placeholder="Teacher I, Teacher II, etc." /></label>
    <label>School<input required value={form.school} onChange={(e) => update("school", e.target.value)} /></label>
    <div className="form-grid"><label>Grade level<input required value={form.gradeLevel} onChange={(e) => update("gradeLevel", e.target.value)} placeholder="Grade 6" /></label><label>Primary subject<input required value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Science" /></label></div>
    <div className="form-grid"><label>Department<input value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="Optional" /></label><label>School year<input required value={form.schoolYear} onChange={(e) => update("schoolYear", e.target.value)} placeholder="2026-2027" /></label></div>
    <button className="primary-button full-width" type="submit">Save teacher profile</button>{status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
