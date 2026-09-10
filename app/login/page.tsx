"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      router.push("/"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in."); }
    finally { setLoading(false); }
  }

  return <main className="auth-page"><section className="auth-card"><div style={{ marginBottom: 18 }}><img src="/coteacher-logo.svg" alt="CoTeacher" style={{ display: "block", width: 180, height: 78, objectFit: "contain", objectPosition: "left center" }} /></div><p className="eyebrow">Teacher Admin Copilot</p><h1>Welcome back</h1><p className="subtitle">Sign in to your teacher workspace.</p><form onSubmit={submit} className="auth-form"><label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form><p className="auth-footer">New to CoTeacher? <Link href="/register">Create an account</Link></p></section></main>;
}