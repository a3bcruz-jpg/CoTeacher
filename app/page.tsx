import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

const documents = [
  { name: "Weekly Accomplishment Report", meta: "Edited 2 hours ago" },
  { name: "Grade 6 Science Lesson Plan", meta: "Edited yesterday" },
  { name: "Brigada Eskwela Narrative Report", meta: "Edited Sep 5" },
];

export default async function Home() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const name = user.teacherProfile?.fullName?.split(" ")[0] || "Teacher";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-name">CoTeacher</div><div className="brand-subtitle">Teacher Admin Copilot</div></div>
        <nav className="nav" aria-label="Main navigation">
          <a className="nav-item active" href="/">Dashboard</a><a className="nav-item" href="/tasks">My Tasks</a><a className="nav-item" href="#documents">Documents</a><a className="nav-item" href="#lessons">Lesson Planner</a><a className="nav-item" href="#assistant">AI Assistant</a><a className="nav-item" href="#profile">My Profile</a>
        </nav>
      </aside>
      <main className="main" id="dashboard">
        <header className="header"><div><div className="eyebrow">Teacher workspace</div><h1>Good morning, {name}.</h1><p className="subtitle">Here’s what needs your attention today.</p></div><form action="/api/auth/logout" method="post"><button className="primary-button" type="submit">Sign out</button></form></header>
        <section className="stats" aria-label="Workspace summary"><div className="card"><div className="stat-label">Tasks due today</div><div className="stat-value">—</div></div><div className="card"><div className="stat-label">Open tasks</div><div className="stat-value">—</div></div><div className="card"><div className="stat-label">Draft documents</div><div className="stat-value">—</div></div><div className="card"><div className="stat-label">AI generations</div><div className="stat-value">—</div></div></section>
        <section className="grid"><div className="card" id="tasks"><div className="card-title"><h2>Priority tasks</h2><a className="stat-label" href="/tasks">Open task manager →</a></div><div className="task-list"><div className="task"><div><div className="task-name">Your live tasks will appear here</div><div className="task-meta">Create your first task in My Tasks.</div></div></div></div></div>
          <div className="card" id="documents"><div className="card-title"><h2>Recent documents</h2><span className="stat-label">Coming next</span></div><div className="document-list">{documents.map(document => <div className="document" key={document.name}><div><div className="document-name">{document.name}</div><div className="document-meta">Example content · document workspace is next</div></div></div>)}</div></div>
          <div className="card" id="assistant"><div className="card-title"><h2>Quick actions</h2></div><div className="quick-actions"><a className="quick-action" href="#document-assistant"><span>Generate a document with AI</span><span>→</span></a><a className="quick-action" href="#lesson-planner"><span>Create a lesson plan</span><span>→</span></a><a className="quick-action" href="/tasks"><span>Add a task or deadline</span><span>→</span></a></div></div>
          <div className="card" id="profile"><div className="card-title"><h2>Account</h2></div><p className="subtitle">Signed in as {user.email}. Your dashboard is protected by an authenticated session.</p></div>
        </section>
      </main>
    </div>
  );
}
