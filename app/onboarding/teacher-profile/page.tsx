import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import TeacherProfileForm from "./TeacherProfileForm";

export default async function TeacherProfilePage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  return <main className="onboarding-shell"><section className="onboarding-card"><div className="eyebrow">CoTeacher setup</div><h1>Tell us about your teaching work.</h1><p className="subtitle">Save your professional details once so CoTeacher can reuse them across your documents and workflows.</p><TeacherProfileForm profile={user.teacherProfile} /></section></main>;
}
