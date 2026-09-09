"use client";

import { useRouter } from "next/navigation";

export function CurriculumAction({ curriculumId }: { curriculumId: string }) {
  const router = useRouter();
  return <div className="curriculum-actions"><button className="primary-button" onClick={() => router.push(`/lesson-planner?curriculumId=${encodeURIComponent(curriculumId)}`)}>Use in Lesson Planner</button><button className="secondary-button" onClick={() => router.push(`/assessment-generator?curriculumId=${encodeURIComponent(curriculumId)}`)}>Use in Assessment Generator</button></div>;
}
