import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const priorityRank = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;

function startOfToday() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()); }
function startOfTomorrow() { const today = startOfToday(); return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); }
function formatDueDate(value: Date | null) { if (!value) return "No deadline"; return value.toLocaleDateString(undefined, { month: "short", day: "numeric" }); }

export default async function Home() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const today = startOfToday();
  const tomorrow = startOfTomorrow();
  const [dueToday, openTasks, draftDocuments, aiGenerations, priorityTasks, recentDocuments] = await Promise.all([
    prisma.task.count({ where: { userId: user.id, status: { not: "COMPLETED" }, dueAt: { gte: today, lt: tomorrow } } }),
    prisma.task.count({ where: { userId: user.id, status: { not: "COMPLETED" } } }),
    prisma.document.count({ where: { userId: user.id, status: "DRAFT" } }),
    prisma.aIGeneration.count({ where: { userId: user.id } }),
    prisma.task.findMany({ where: { userId: user.id, status: { not: "COMPLETED" } }, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }], take: 6, select: { id: true, title: true, dueAt: true, priority: true, status: true } }),
    prisma.document.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
  ]);
  const sortedTasks = [...priorityTasks].sort((a, b) => { const priority = priorityRank[a.priority] - priorityRank[b.priority]; if (priority !== 0) return priority; return (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER); });
  const profile = user.teacherProfile;
  const firstName = profile?.fullName?.split(" ")[0] || "Teacher";
  const greetingTitle = profile?.title === "MAAM" ? "Ma'am" : profile?.title === "SIR" ? "Sir" : "Teacher";
  const greeting = greetingTitle === "Teacher" ? `Good morning, ${firstName}.` : `Good morning, ${greetingTitle} ${firstName}.`;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/coteacher-logo.svg" alt="CoTeacher" />
          <div><div className="brand-name">CoTeacher</div><div className="brand-subtitle">Teacher Admin Copilot</div><div className="brand-tagline">Less paperwork. More teaching.</div></div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <a className="nav-item active" href="/">◈ <span>Dashboard</span></a><a className="nav-item" href="/tasks">✓ <span>My Tasks</span></a><a className="nav-item" href="/documents">▤ <span>Documents</span></a><a className="nav-item" href="/lesson-planner">▱ <span>Lesson Planner</span></a><a className="nav-item" href="/ai">✦ <span>AI Assistant</span></a><a className="nav-item" href="/onboarding">♙ <span>My Profile</span></a>
        </nav>
        <div className="sidebar-footer"><div className="sidebar-avatar">{firstName.charAt(0).toUpperCase()}</div><div><strong>{greetingTitle} {firstName}</strong><small>Teacher workspace</small></div></div>
      </aside>
      <main className="main" id="dashboard">
        <header className="header dashboard-header"><div><div className="eyebrow">Teacher workspace</div><h1>{greeting}</h1><p className="subtitle">Here’s what needs your attention today.</p></div><form action="/api/auth/logout" method="post"><button className="secondary-button" type="submit">Sign out</button></form></header>
        <section className="welcome-banner"><div><span className="welcome-kicker">YOUR TEACHING COPILOT</span><h2>Less paperwork.<br />More teaching.</h2><p>Keep your tasks, documents, and lesson planning moving from one calm workspace.</p><div className="welcome-actions"><a className="primary-button" href="/ai">Ask CoTeacher <span>→</span></a><a className="banner-link" href="/tasks">View today’s tasks</a></div></div><div className="welcome-illustration" aria-hidden="true"><div className="spark spark-one">✦</div><div className="book"><span></span><span></span></div><div className="spark spark-two">✦</div></div></section>
        <section className="stats" aria-label="Workspace summary">
          <div className="card stat-card"><div className="stat-icon task-icon">✓</div><div><div className="stat-label">Tasks due today</div><div className="stat-value">{dueToday}</div></div></div><div className="card stat-card"><div className="stat-icon doc-icon">▤</div><div><div className="stat-label">Open tasks</div><div className="stat-value">{openTasks}</div></div></div><div className="card stat-card"><div className="stat-icon lesson-icon">▱</div><div><div className="stat-label">Draft documents</div><div className="stat-value">{draftDocuments}</div></div></div><div className="card stat-card"><div className="stat-icon ai-icon">✦</div><div><div className="stat-label">AI generations</div><div className="stat-value">{aiGenerations}</div></div></div>
        </section>
        <section className="grid">
          <div className="card" id="tasks"><div className="card-title"><h2>Priority tasks</h2><a className="stat-label" href="/tasks">Open task manager →</a></div>{sortedTasks.length ? <div className="task-list">{sortedTasks.map((task) => <a className="task" href="/tasks" key={task.id}><div><div className="task-name">{task.title}</div><div className="task-meta">{task.priority} · {task.status === "IN_PROGRESS" ? "In progress" : "To do"} · {formatDueDate(task.dueAt)}</div></div><span className={`priority-dot priority-${task.priority.toLowerCase()}`} /></a>)}</div> : <div className="empty-state"><h3>You’re all caught up.</h3><p>Create a task when something needs your attention.</p></div>}</div>
          <div className="card" id="documents"><div className="card-title"><h2>Recent documents</h2><a className="stat-label" href="/documents">Open documents →</a></div>{recentDocuments.length ? <div className="document-list">{recentDocuments.map((document) => <a className="document" href={`/documents/${document.id}`} key={document.id}><div><div className="document-name">{document.title}</div><div className="document-meta">{document.status} · Updated {document.updatedAt.toLocaleDateString()}</div></div><span>→</span></a>)}</div> : <div className="empty-state"><h3>No documents yet.</h3><p>Your document workspace is ready for your first document.</p></div>}</div>
          <div className="card" id="assistant"><div className="card-title"><h2>Quick actions</h2><span className="card-accent">Get things done</span></div><div className="quick-actions"><a className="quick-action" href="/ai"><span><b>✦</b> Generate a document with AI</span><span>→</span></a><a className="quick-action" href="/lesson-planner"><span><b>▱</b> Create a lesson plan</span><span>→</span></a><a className="quick-action" href="/tasks"><span><b>✓</b> Add a task or deadline</span><span>→</span></a></div></div>
          <div className="card profile-card" id="profile"><div className="card-title"><h2>Your teaching profile</h2><a className="stat-label" href="/onboarding">Edit profile →</a></div><div className="profile-summary"><div className="profile-avatar">{firstName.charAt(0).toUpperCase()}</div><div><strong>{greetingTitle} {profile?.fullName || "Teacher"}</strong><p>{profile?.position || "Teacher"}{profile?.school ? ` · ${profile.school.name}` : ""}</p><small>{profile?.gradeLevel || "Grade level not set"}{profile?.schoolYear ? ` · SY ${profile.schoolYear}` : ""}</small></div></div></div>
        </section>
      </main>
    </div>
  );
}
