import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const priorityRank = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfTomorrow() {
  const today = startOfToday();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
}

function formatDueDate(value: Date | null) {
  if (!value) return "No deadline";
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

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
    prisma.task.findMany({
      where: { userId: user.id, status: { not: "COMPLETED" } },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: { id: true, title: true, dueAt: true, priority: true, status: true },
    }),
    prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
  ]);

  const sortedTasks = [...priorityTasks].sort((a, b) => {
    const priority = priorityRank[a.priority] - priorityRank[b.priority];
    if (priority !== 0) return priority;
    return (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
  });

  const name = user.teacherProfile?.fullName?.split(" ")[0] || "Teacher";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-name">CoTeacher</div>
          <div className="brand-subtitle">Teacher Admin Copilot</div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <a className="nav-item active" href="/">Dashboard</a>
          <a className="nav-item" href="/tasks">My Tasks</a>
          <a className="nav-item" href="/documents">Documents</a>
          <a className="nav-item" href="/lesson-planner">Lesson Planner</a>
          <a className="nav-item" href="/ai">AI Assistant</a>
          <a className="nav-item" href="/onboarding">My Profile</a>
        </nav>
      </aside>

      <main className="main" id="dashboard">
        <header className="header">
          <div>
            <div className="eyebrow">Teacher workspace</div>
            <h1>Good morning, {name}.</h1>
            <p className="subtitle">Here’s what needs your attention today.</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="primary-button" type="submit">Sign out</button>
          </form>
        </header>

        <section className="stats" aria-label="Workspace summary">
          <div className="card"><div className="stat-label">Tasks due today</div><div className="stat-value">{dueToday}</div></div>
          <div className="card"><div className="stat-label">Open tasks</div><div className="stat-value">{openTasks}</div></div>
          <div className="card"><div className="stat-label">Draft documents</div><div className="stat-value">{draftDocuments}</div></div>
          <div className="card"><div className="stat-label">AI generations</div><div className="stat-value">{aiGenerations}</div></div>
        </section>

        <section className="grid">
          <div className="card" id="tasks">
            <div className="card-title"><h2>Priority tasks</h2><a className="stat-label" href="/tasks">Open task manager →</a></div>
            {sortedTasks.length ? (
              <div className="task-list">
                {sortedTasks.map((task) => (
                  <a className="task" href="/tasks" key={task.id}>
                    <div>
                      <div className="task-name">{task.title}</div>
                      <div className="task-meta">{task.priority} · {task.status === "IN_PROGRESS" ? "In progress" : "To do"} · {formatDueDate(task.dueAt)}</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="task-list"><div className="task"><div><div className="task-name">You’re all caught up.</div><div className="task-meta">Create a task when something needs your attention.</div></div></div></div>
            )}
          </div>

          <div className="card" id="documents">
            <div className="card-title"><h2>Recent documents</h2><a className="stat-label" href="/documents">Open documents →</a></div>
            {recentDocuments.length ? (
              <div className="document-list">
                {recentDocuments.map((document) => (
                  <a className="document" href={`/documents/${document.id}`} key={document.id}>
                    <div>
                      <div className="document-name">{document.title}</div>
                      <div className="document-meta">{document.status} · Updated {document.updatedAt.toLocaleDateString()}</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="task"><div><div className="task-name">No documents yet.</div><div className="task-meta">Your document workspace is ready for your first document.</div></div></div>
            )}
          </div>

          <div className="card" id="assistant">
            <div className="card-title"><h2>Quick actions</h2></div>
            <div className="quick-actions">
              <a className="quick-action" href="/ai"><span>Generate a document with AI</span><span>→</span></a>
              <a className="quick-action" href="/lesson-planner"><span>Create a lesson plan</span><span>→</span></a>
              <a className="quick-action" href="/tasks"><span>Add a task or deadline</span><span>→</span></a>
            </div>
          </div>

          <div className="card" id="profile">
            <div className="card-title"><h2>Account</h2><a className="stat-label" href="/onboarding">Edit profile →</a></div>
            <p className="subtitle">Signed in as {user.email}. Your dashboard is protected by an authenticated session.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
