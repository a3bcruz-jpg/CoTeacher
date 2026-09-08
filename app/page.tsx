const tasks = [
  { name: "Submit weekly accomplishment report", meta: "Due today", badge: "Due today", tone: "danger" },
  { name: "Prepare Grade 6 Science lesson", meta: "Tomorrow · Science", badge: "Tomorrow", tone: "warning" },
  { name: "Review quarterly assessment", meta: "Friday · Assessment", badge: "Friday", tone: "warning" },
];

const documents = [
  { name: "Weekly Accomplishment Report", meta: "Edited 2 hours ago" },
  { name: "Grade 6 Science Lesson Plan", meta: "Edited yesterday" },
  { name: "Brigada Eskwela Narrative Report", meta: "Edited Sep 5" },
];

export default function Home() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-name">CoTeacher</div>
          <div className="brand-subtitle">Teacher Admin Copilot</div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <a className="nav-item active" href="#dashboard">Dashboard</a>
          <a className="nav-item" href="#tasks">My Tasks</a>
          <a className="nav-item" href="#documents">Documents</a>
          <a className="nav-item" href="#lessons">Lesson Planner</a>
          <a className="nav-item" href="#assistant">AI Assistant</a>
          <a className="nav-item" href="#profile">My Profile</a>
        </nav>
      </aside>

      <main className="main" id="dashboard">
        <header className="header">
          <div>
            <div className="eyebrow">Teacher workspace</div>
            <h1>Good morning, Teacher.</h1>
            <p className="subtitle">Here’s what needs your attention today.</p>
          </div>
          <button className="primary-button" type="button">+ Create document</button>
        </header>

        <section className="stats" aria-label="Workspace summary">
          <div className="card"><div className="stat-label">Tasks due today</div><div className="stat-value">3</div></div>
          <div className="card"><div className="stat-label">Open tasks</div><div className="stat-value">11</div></div>
          <div className="card"><div className="stat-label">Draft documents</div><div className="stat-value">4</div></div>
          <div className="card"><div className="stat-label">AI generations</div><div className="stat-value">8</div></div>
        </section>

        <section className="grid">
          <div className="card" id="tasks">
            <div className="card-title"><h2>Priority tasks</h2><span className="stat-label">This week</span></div>
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task" key={task.name}>
                  <div><div className="task-name">{task.name}</div><div className="task-meta">{task.meta}</div></div>
                  <span className={`badge badge-${task.tone}`}>{task.badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" id="documents">
            <div className="card-title"><h2>Recent documents</h2><span className="stat-label">View all</span></div>
            <div className="document-list">
              {documents.map((document) => (
                <div className="document" key={document.name}>
                  <div><div className="document-name">{document.name}</div><div className="document-meta">{document.meta}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" id="assistant">
            <div className="card-title"><h2>Quick actions</h2></div>
            <div className="quick-actions">
              <a className="quick-action" href="#document-assistant"><span>Generate a document with AI</span><span>→</span></a>
              <a className="quick-action" href="#lesson-planner"><span>Create a lesson plan</span><span>→</span></a>
              <a className="quick-action" href="#tasks"><span>Add a task or deadline</span><span>→</span></a>
            </div>
          </div>

          <div className="card" id="profile">
            <div className="card-title"><h2>MVP status</h2></div>
            <p className="subtitle">The interface foundation is ready. Authentication, database, document workflows, and AI services are next.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
