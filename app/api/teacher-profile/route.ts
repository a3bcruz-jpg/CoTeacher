import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = body.title === "SIR" || body.title === "MAAM" ? body.title : null;
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const school = typeof body.school === "string" ? body.school.trim() : "";
  const gradeLevel = typeof body.gradeLevel === "string" ? body.gradeLevel.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const position = typeof body.position === "string" ? body.position.trim() : null;
  const department = typeof body.department === "string" ? body.department.trim() : null;
  const schoolYear = typeof body.schoolYear === "string" ? body.schoolYear.trim() : "";

  if (!title || !fullName || !school || !gradeLevel || !subject || !schoolYear) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingSchool = await tx.school.findFirst({ where: { name: school } });
    const schoolRecord = existingSchool ?? await tx.school.create({ data: { name: school } });

    const profile = await tx.teacherProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, schoolId: schoolRecord.id, title, fullName, position: position || null, gradeLevel, department: department || null, schoolYear },
      update: { schoolId: schoolRecord.id, title, fullName, position: position || null, gradeLevel, department: department || null, schoolYear },
    });

    const className = `${gradeLevel} · ${subject}`;
    const existingClass = await tx.class.findFirst({ where: { teacherId: profile.id, name: className, schoolYear } });
    const classRecord = existingClass
      ? await tx.class.update({ where: { id: existingClass.id }, data: { gradeLevel, schoolId: schoolRecord.id } })
      : await tx.class.create({ data: { teacherId: profile.id, schoolId: schoolRecord.id, name: className, gradeLevel, schoolYear } });

    const existingSubject = await tx.subject.findFirst({ where: { classId: classRecord.id, name: subject } });
    if (!existingSubject) await tx.subject.create({ data: { classId: classRecord.id, name: subject, gradeLevel } });

    return profile;
  });

  return NextResponse.json({ profile: result });
}
