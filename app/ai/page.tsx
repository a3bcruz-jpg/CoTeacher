"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/app/components/AppShell";

type Message = { role: "user" | "assistant"; content: string };
const suggestions = ["Organize my tasks", "Summarize my open tasks.", "Draft a school document", "Review my workload"];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    setInput(""); setStatus(""); setMessages((current) => [...current, { role: "user", content: message }]); setLoading(true);
    try {
      const response = await fetch("/api/ai/assistant", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to get an answer.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer || "I couldn't generate an answer." }]);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to reach the AI assistant."); }
    finally { setLoading(false); }
  }

  return <AppShell active="/ai"><main className="page-shell">
    <header className="page-header"><div><div className="eyebrow">Your quiet administrative partner</div><h1>What can I help you take off your plate?</h1><p className="subtitle">Ask about your tasks, documents, lesson planning, or teaching workspace.</p></div></header>
    <section className="ai-chat-shell card">
      <div className="ai-chat-intro"><div className="hero-icon" aria-hidden="true">✦</div><div><h2>CoTeacher AI</h2><p>Your workspace context stays scoped to your account. AI responses are drafts and should be reviewed.</p></div></div>
      {messages.length === 0 ? <div className="ai-empty"><h3>Start with a task</h3><div className="suggestion-grid">{suggestions.map((suggestion) => <button key={suggestion} className="suggestion" onClick={() => { setInput(suggestion); setStatus(""); }} type="button">{suggestion}<span aria-hidden="true">→</span></button>)}</div></div> : <div className="ai-messages" aria-live="polite">{messages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`}><div className="ai-message-label">{message.role === "user" ? "You" : "CoTeacher"}</div><div className="ai-message-content">{message.content}</div></div>)}{loading && <div className="ai-message assistant"><div className="ai-message-label">CoTeacher</div><div className="ai-message-content">Thinking through your workspace...</div></div>}</div>}
      {status && <p className="form-error" role="alert">{status}</p>}
      <form className="ai-composer" onSubmit={send}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask CoTeacher about your work..." rows={3} maxLength={6000} disabled={loading} aria-label="Message CoTeacher" /><button className="primary-button" type="submit" disabled={loading || !input.trim()}>{loading ? "Thinking..." : "Ask CoTeacher →"}</button></form>
      <p className="disclaimer">Review AI-generated information before using it for official school work or submissions.</p>
    </section>
  </main></AppShell>;
}
