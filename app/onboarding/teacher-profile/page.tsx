import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import TeacherProfileForm from "./TeacherProfileForm";

export default async function TeacherProfilePage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return <main className="onboarding-shell">
    <section className="onboarding-card">
      <div className="eyebrow">CoTeacher setup · Step 1 of 1</div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, margin:"12px 0 24px" }}>
        <div><h1 style={{ marginBottom:7 }}>Make CoTeacher yours.</h1><p className="subtitle">Save your professional details once so your workspace can reuse them across documents and workflows.</p></div>
        <div className="profile-avatar" aria-hidden="true">{user.teacherProfile?.fullName?.charAt(0)?.toUpperCase() || "T"}</div>
      </div>
      <div className="profile-intro" style={{ marginBottom:20 }}><div className="title-icon" aria-hidden="true">✓</div><div><strong>A little setup now, less repetition later.</strong><p>Only provide information you want CoTeacher to reuse. You can update it anytime.</p></div></div>
      <TeacherProfileForm profile={user.teacherProfile} />
      <p className="disclaimer" style={{ textAlign:"center" }}>You're in control of your workspace. Review AI-generated content before using it for official work.</p>
    </section>
  </main>;
}
