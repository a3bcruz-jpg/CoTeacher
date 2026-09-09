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

const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

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

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ title, description, dueAt, priority, category }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to create task.");
      setTasks((current) => [data.task, ...current]);
      setTitle("");
      setDescription("");
      setDueAt("");
      setPriority("MEDIUM");
      setCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create task.");
    } finally {
      setSaving(false);
    }
  }

  async function update(id: string, status: string) {
    setError("");
    const response = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to update task.");
      return;
    }
    setTasks((current) => current.map((task) => task.id === id ? data.task : task));
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this task?")) return;
    setError("");
    const response = await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to delete task.");
      return;
    }
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const open = useMemo(() => tasks.filter((task) => task.status !== "COMPLETED"), [tasks]);
  const completed = tasks.length - open.length;

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <div className="eyebrow">CoTeacher workspace</div>
          <h1>My Tasks</h1>
          <p className="subtitle">Keep reports, activities, lessons, and deadlines in one place.</p>
        </div>
        <a className="secondary-button" href="/">Back to dashboard</a>
      </header>

      <section className="task-page-grid">
        <div className="card">
          <div className="card-title"><h2>Add a task</h2><span className="stat-label">Private workspace</span></div>
          <form className="profile-form" onSubmit={create}>
            <label>Task title<input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Submit quarterly report" /></label>
            <label>Description<textarea maxLength={2000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional notes" /></label>
            <div className="form-grid">
              <label>Due date<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>
              <label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label>
            </div>
            <label>Category<input maxLength={100} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Reports" /></label>
            <button className="primary-button full-width" disabled={saving} type="submit">{saving ? "Adding..." : "Add task"}</button>
          </form>
        </div>

        <div className="card">
          <div className="card-title"><h2>Overview</h2></div>
          <div className="stats compact-stats">
            <div><span className="stat-label">Open</span><div className="stat-value">{open.length}</div></div>
            <div><span className="stat-label">Completed</span><div className="stat-value">{completed}</div></div>
          </div>
        </div>

        <div className="card task-card-wide">
          <div className="card-title"><h2>All tasks</h2><button className="small-button" onClick={() => void load()} type="button">Refresh</button></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {loading ? <p className="subtitle">Loading tasks...</p> : tasks.length === 0 ? <p className="empty-state">No tasks yet. Add your first task above.</p> : (
            <div className="task-list">
              {tasks.map((task) => (
                <div className={`task ${task.status === "COMPLETED" ? "task-completed" : ""}`} key={task.id}>
                  <div>
                    <div className="task-name">{task.title}</div>
                    <div className="task-meta">{task.category || "General"} · {task.dueAt ? new Date(task.dueAt).toLocaleString() : "No deadline"} · {priorityLabel[task.priority] || task.priority}</div>
                  </div>
                  <div className="task-actions">
                    {task.status !== "COMPLETED" && <button className="small-button" onClick={() => void update(task.id, "COMPLETED")} type="button">Complete</button>}
                    <button className="small-button danger-button" onClick={() => void remove(task.id)} type="button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
