"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Task = { id:string; title:string; description:string|null; dueAt:string|null; priority:string; status:string; category:string|null };

const priorityLabel: Record<string,string> = { LOW:"Low", MEDIUM:"Medium", HIGH:"High", URGENT:"Urgent" };

export default function TasksPage() {
  const [tasks,setTasks] = useState<Task[]>([]); const [loading,setLoading] = useState(true); const [error,setError] = useState("");
  const [title,setTitle] = useState(""); const [dueAt,setDueAt] = useState(""); const [priority,setPriority] = useState("MEDIUM"); const [category,setCategory] = useState("");

  async function load(){ setLoading(true); const r=await fetch("/api/tasks",{cache:"no-store"}); const d=await r.json().catch(()=>({})); if(!r.ok){setError(d.error||"Unable to load tasks.");setLoading(false);return;} setTasks(d.tasks||[]);setLoading(false); }
  useEffect(()=>{load()},[]);
  async function create(e:FormEvent){ e.preventDefault(); setError(""); if(!title.trim())return; const r=await fetch("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,dueAt,priority,category})}); const d=await r.json().catch(()=>({})); if(!r.ok){setError(d.error||"Unable to create task.");return;} setTasks(x=>[d.task,...x]); setTitle("");setDueAt("");setPriority("MEDIUM");setCategory(""); }
  async function update(id:string,status:string){ const r=await fetch("/api/tasks",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})}); const d=await r.json().catch(()=>({})); if(!r.ok){setError(d.error||"Unable to update task.");return;} setTasks(x=>x.map(t=>t.id===id?d.task:t)); }
  async function remove(id:string){ if(!confirm("Delete this task?"))return; const r=await fetch(`/api/tasks?id=${encodeURIComponent(id)}`,{method:"DELETE"}); if(!r.ok){const d=await r.json().catch(()=>({}));setError(d.error||"Unable to delete task.");return;} setTasks(x=>x.filter(t=>t.id!==id)); }
  const open=useMemo(()=>tasks.filter(t=>t.status!=="COMPLETED"),[tasks]); const completed=tasks.length-open.length;
  return <main className="main"><div className="header"><div><div className="eyebrow">My Tasks</div><h1>Stay on top of your work.</h1><p className="subtitle">Capture deadlines and school work in one place.</p></div></div>
    <section className="task-page-grid"><div className="card"><div className="card-title"><h2>Create a task</h2></div><form className="profile-form" onSubmit={create}><label>Task title<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Submit quarterly report" /></label><div className="form-grid"><label>Due date<input type="datetime-local" value={dueAt} onChange={e=>setDueAt(e.target.value)} /></label><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label></div><label>Category<input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Reports" /></label><button className="primary-button full-width">Add task</button></form></div>
    <div className="card"><div className="card-title"><h2>Overview</h2></div><div className="stats compact-stats"><div><span className="stat-label">Open</span><div className="stat-value">{open.length}</div></div><div><span className="stat-label">Completed</span><div className="stat-value">{completed}</div></div></div></div>
    <div className="card task-card-wide"><div className="card-title"><h2>All tasks</h2></div>{error&&<p className="form-error">{error}</p>}{loading?<p className="subtitle">Loading tasks...</p>:tasks.length===0?<p className="subtitle">No tasks yet. Add your first task above.</p>:<div className="task-list">{tasks.map(t=><div className={`task ${t.status==='COMPLETED'?'task-completed':''}`} key={t.id}><div><div className="task-name">{t.title}</div><div className="task-meta">{t.category||"General"} · {t.dueAt?new Date(t.dueAt).toLocaleString():"No deadline"} · {priorityLabel[t.priority]}</div></div><div className="task-actions">{t.status!=="COMPLETED"&&<button className="small-button" onClick={()=>update(t.id,"COMPLETED")}>Complete</button>}<button className="small-button danger-button" onClick={()=>remove(t.id)}>Delete</button></div></div>)}</div>}</div></section></main>
}
