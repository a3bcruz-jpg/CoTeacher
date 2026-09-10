"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setLoading(true); try { const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, email, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Unable to create account."); router.push("/onboarding/teacher-profile"); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to create account."); } finally { setLoading(false); } }
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand">CoTeacher<span>.</span></div><p className="eyebrow">Teacher Admin Copilot</p><h1>Create your account</h1><p className="subtitle">Set up your workspace and start reducing repetitive work.</p><form onSubmit={submit} className="auth-form"><label>Full name<input autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required minLength={2} /></label><label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /><small>Use at least 8 characters.</small></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button></form><p className="auth-footer">Already have an account? <Link href="/login">Sign in</Link></p></section></main>;
}
