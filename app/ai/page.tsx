"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "What should I work on first?",
  "Summarize my open tasks.",
  "Help me organize my documents.",
  "What information do you know about my teaching workspace?"
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    setStatus("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);
    try {
      const response = await fetch("/api/ai/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to get an answer.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer || "I couldn't generate an answer." }]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to reach the AI assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <div className="eyebrow">CoTeacher AI</div>
          <h1>Contextual AI Assistant</h1>
          <p className="subtitle">Ask about your own tasks, documents, and teaching workspace.</p>
        </div>
        <a className="secondary-button" href="/">Dashboard</a>
      </header>
      <section className="ai-chat-shell card">
        <div className="ai-chat-intro">
          <div className="hero-icon">✦</div>
          <div><h2>Your private teaching copilot</h2><p>CoTeacher uses only the workspace context available to your account for this conversation.</p></div>
        </div>
        {messages.length === 0 ? <div className="ai-empty"><h3>What can I help with?</h3><div className="suggestion-grid">{suggestions.map((suggestion) => <button key={suggestion} className="suggestion" onClick={() => { setInput(suggestion); }} type="button">{suggestion}<span>→</span></button>)}</div></div> : <div className="ai-messages">{messages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`}><div className="ai-message-label">{message.role === "user" ? "You" : "CoTeacher"}</div><div className="ai-message-content">{message.content}</div></div>)}{loading && <div className="ai-message assistant"><div className="ai-message-label">CoTeacher</div><div className="ai-message-content">Thinking through your workspace...</div></div>}</div>}
        {status && <p className="form-error" role="alert">{status}</p>}
        <form className="ai-composer" onSubmit={send}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask CoTeacher about your work..." rows={3} maxLength={6000} disabled={loading} /><button className="primary-button" type="submit" disabled={loading || !input.trim()}>{loading ? "Thinking..." : "Ask CoTeacher →"}</button></form>
        <p className="disclaimer">AI responses are drafts and may be incomplete. Review important information before acting on it.</p>
      </section>
      <style jsx global>{`
        .ai-chat-shell{max-width:980px;margin:0 auto;padding:26px}.ai-chat-intro{display:flex;gap:16px;align-items:center;padding-bottom:22px;border-bottom:1px solid #e6edf4}.ai-chat-intro h2{margin:0 0 5px;font-size:20px}.ai-chat-intro p{margin:0;color:var(--muted);font-size:13px}.hero-icon{width:58px;height:58px;display:grid;place-items:center;border-radius:18px;background:linear-gradient(145deg,#1769e0,#27c58a);color:#fff;font-size:25px;box-shadow:0 12px 25px rgba(23,105,224,.18)}.ai-empty{padding:48px 0}.ai-empty h3{margin:0 0 16px}.suggestion-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.suggestion{border:1px solid #dce7f0;background:#fbfdff;border-radius:13px;padding:14px;text-align:left;font-weight:700;color:#24344c;display:flex;justify-content:space-between;cursor:pointer}.suggestion:hover{border-color:#b8d1ea;background:#f4f9ff}.ai-messages{display:flex;flex-direction:column;gap:13px;padding:24px 0;min-height:260px}.ai-message{max-width:82%;padding:13px 15px;border-radius:15px;border:1px solid #e1e8ef}.ai-message.user{align-self:flex-end;background:#eef6ff;border-color:#d5e6fa}.ai-message.assistant{align-self:flex-start;background:#f6fbf8;border-color:#d8efe4}.ai-message-label{font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#66758a;margin-bottom:5px}.ai-message-content{white-space:pre-wrap;line-height:1.55;font-size:13px}.ai-composer{display:flex;gap:10px;align-items:flex-end;padding-top:18px;border-top:1px solid #e6edf4}.ai-composer textarea{flex:1;resize:vertical;min-height:70px;border:1px solid #d6e0ea;border-radius:12px;padding:12px;font:inherit}.ai-composer .primary-button{white-space:nowrap}.disclaimer{margin:12px 0 0;color:var(--muted);font-size:11px}@media(max-width:650px){.suggestion-grid{grid-template-columns:1fr}.ai-chat-shell{padding:18px}.ai-composer{flex-direction:column;align-items:stretch}.ai-message{max-width:94%}}
      `}</style>
    </main>
  );
}
