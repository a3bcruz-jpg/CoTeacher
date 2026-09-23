import type { ReactNode } from "react";

const items = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/tasks", label: "Tasks", icon: "✓" },
  { href: "/documents", label: "Documents", icon: "▤" },
  { href: "/lesson-planner", label: "Lesson Planner", icon: "▱" },
  { href: "/ai", label: "AI Assistant", icon: "✦" },
  { href: "/onboarding", label: "Profile", icon: "♙" },
];

export function AppShell({ children, active }: { children: ReactNode; active: string }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="CoTeacher home">
          <img className="brand-logo" src="/coteacher-logo.svg" alt="" />
          <div><div className="brand-name">CoTeacher</div><div className="brand-subtitle">Teacher Admin Copilot</div><div className="brand-tagline">Less paperwork. More teaching.</div></div>
        </a>
        <nav className="nav" aria-label="Main navigation">
          {items.map((item) => <a key={item.href} className={`nav-item ${active === item.href ? "active" : ""}`} href={item.href} aria-current={active === item.href ? "page" : undefined}><span aria-hidden="true">{item.icon}</span><span>{item.label}</span></a>)}
        </nav>
        <div className="sidebar-footer"><div className="sidebar-avatar" aria-hidden="true">T</div><div><strong>Teacher workspace</strong><small>Your private CoTeacher space</small></div></div>
      </aside>
      {children}
    </div>
  );
}
