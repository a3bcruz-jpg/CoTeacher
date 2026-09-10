"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: string;
  status: string;
  category: string | null;
};

const priorityLabel: Record<string, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" };
const categoryPalette = ["blue", "green", "violet", "orange", "teal", "pink"];

function categoryTone(category: string | null) {
  const value = (category || "General").trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
  return categoryPalette[Math.abs(hash) % categoryPalette.length];
}

function priorityTone(priority: string) {
  return priority.toLowerCase();
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to load tasks.");
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ title, description, dueAt, priority, category }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to create task.");
      setTasks((current) => [data.task, ...current]);
      setTitle(""); setDescription(""); setDueAt(""); setPriority("MEDIUM"); setCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create task.");
    } finally { setSaving(false); }
  }

  async function update(id: string, status: string) {
    setError("");
    const response = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || "Unable to update task."); return; }
    setTasks((current) => current.map((task) => task.id === id ? data.task : task));
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this task?")) return;
    setError("");
    const response = await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || "Unable to delete task."); return; }
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const open = useMemo(() => tasks.filter((task) => task.status !== "COMPLETED"), [tasks]);
  const completed = tasks.length - open.length;

  return (
    <main className="page-shell">
      <header className="page-header tasks-hero">
        <div className="tasks-hero-copy">
          <div className="hero-icon"><span>✓</span></div>
          <div><div className="eyebrow">CoTeacher workspace</div><h1>My Tasks</h1><p className="subtitle">Keep reports, activities, lessons, and deadlines in one place.</p></div>
        </div>
        <a className="secondary-button hero-back" href="/">←&nbsp; Back to dashboard</a>
      </header>

      <section className="task-page-grid">
        <div className="card task-create-card">
          <div className="card-title"><div><span className="section-kicker blue-kicker">CREATE</span><h2>Add a task</h2></div><span className="privacy-pill">Private workspace</span></div>
          <form className="profile-form" onSubmit={create}>
            <label>Task title<input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Submit quarterly report" /></label>
            <label>Description<textarea maxLength={2000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional notes" /></label>
            <div className="form-grid"><label>Due date<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label></div>
            <label>Category<input maxLength={100} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Reports, Lesson, Activity..." /></label>
            <button className="primary-button full-width task-add-button" disabled={saving} type="submit">{saving ? "Adding..." : "Add task  →"}</button>
          </form>
        </div>

        <div className="card task-overview-card">
          <div className="card-title"><div><span className="section-kicker green-kicker">AT A GLANCE</span><h2>Overview</h2></div></div>
          <div className="overview-metrics"><div className="overview-metric blue-metric"><span>Open</span><strong>{open.length}</strong><small>needs attention</small></div><div className="overview-metric green-metric"><span>Completed</span><strong>{completed}</strong><small>already done</small></div></div>
          <div className="overview-note"><span>✓</span><div><strong>Stay on top of your work</strong><p>Use categories and priorities to quickly spot what matters most.</p></div></div>
        </div>

        <div className="card task-card-wide">
          <div className="card-title"><div><span className="section-kicker violet-kicker">WORKSPACE</span><h2>All tasks</h2></div><button className="small-button" onClick={() => void load()} type="button">↻ Refresh</button></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {loading ? <p className="subtitle">Loading tasks...</p> : tasks.length === 0 ? <div className="empty-state task-empty"><div className="empty-icon">✓</div><h3>Your task list is ready.</h3><p>Add a task above and CoTeacher will keep it organized for you.</p></div> : (
            <div className="task-list">
              {tasks.map((task) => (
                <div className={`task task-row ${task.status === "COMPLETED" ? "task-completed" : ""}`} key={task.id}>
                  <div className="task-row-main"><div className={`category-mark category-${categoryTone(task.category)}`} aria-hidden="true"></div><div><div className="task-name">{task.title}</div><div className="task-meta"><span className={`category-chip category-chip-${categoryTone(task.category)}`}>{task.category || "General"}</span>{task.dueAt ? <span>{new Date(task.dueAt).toLocaleString()}</span> : <span>No deadline</span>}<span className={`priority-chip priority-chip-${priorityTone(task.priority)}`}>{priorityLabel[task.priority] || task.priority}</span></div></div></div>
                  <div className="task-actions">{task.status !== "COMPLETED" && <button className="small-button complete-button" onClick={() => void update(task.id, "COMPLETED")} type="button">✓ Complete</button>}<button className="small-button danger-button" onClick={() => void remove(task.id)} type="button">Delete</button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
