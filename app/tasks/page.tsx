import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

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

      <section className="card task-manager" aria-labelledby="new-task-heading">
        <div className="card-title"><h2 id="new-task-heading">Add a task</h2><span className="stat-label">Your private workspace</span></div>
        <form className="task-form" action="/api/tasks" method="post">
          <label>Task title<input name="title" required maxLength={200} placeholder="e.g. Submit weekly accomplishment report" /></label>
          <label>Due date<input name="dueAt" type="datetime-local" /></label>
          <label>Priority<select name="priority" defaultValue="MEDIUM"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label>
          <label>Category<input name="category" maxLength={100} placeholder="Report, lesson, meeting..." /></label>
          <label className="full">Description<textarea name="description" maxLength={2000} rows={4} placeholder="Optional notes" /></label>
          <button className="primary-button" type="submit">Create task</button>
        </form>
      </section>

      <section className="card" aria-labelledby="task-note-heading">
        <div className="card-title"><h2 id="task-note-heading">Task manager foundation</h2></div>
        <p className="subtitle">The authenticated API is now in place. The next iteration will connect this form to live task cards, filtering, completion, editing, deletion, and persistent UI states.</p>
      </section>
    </main>
  );
}
