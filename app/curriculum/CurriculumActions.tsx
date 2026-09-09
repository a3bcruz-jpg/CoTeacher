"use client";

import { useRouter } from "next/navigation";

export default function CurriculumActions({ curriculumId }: { curriculumId: string }) {
  const router = useRouter();
  const navigate = (path: string) => router.push(`${path}?curriculumId=${encodeURIComponent(curriculumId)}`);

  return (
    <div className="export-actions">
      <button type="button" className="primary-button" onClick={() => navigate("/lesson-planner")}>Use in Lesson Planner</button>
      <button type="button" className="secondary-button" onClick={() => navigate("/assessment-generator")}>Use in Assessment Generator</button>
    </div>
  );
}
