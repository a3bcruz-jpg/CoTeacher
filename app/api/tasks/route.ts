import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const statuses = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Task title is required." }, { status: 400 });

  const priority = typeof body.priority === "string" && priorities.includes(body.priority as any) ? body.priority as typeof priorities[number] : "MEDIUM";
  const dueAt = typeof body.dueAt === "string" && body.dueAt ? new Date(body.dueAt) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) return NextResponse.json({ error: "Invalid due date." }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      dueAt,
      priority,
      category: typeof body.category === "string" ? body.category.trim() || null : null,
      recurring: body.recurring === true,
      recurrence: typeof body.recurrence === "string" ? body.recurrence.trim() || null : null,
    },
  });
  return NextResponse.json({ task }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });

  const existing = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  const status = typeof body.status === "string" && statuses.includes(body.status as any) ? body.status as typeof statuses[number] : undefined;
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
      ...(typeof body.description === "string" ? { description: body.description.trim() || null } : {}),
      ...(status ? { status, completedAt: status === "COMPLETED" ? new Date() : null } : {}),
      ...(typeof body.priority === "string" && priorities.includes(body.priority as any) ? { priority: body.priority as typeof priorities[number] } : {}),
      ...(typeof body.category === "string" ? { category: body.category.trim() || null } : {}),
      ...(typeof body.dueAt === "string" ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {}),
    },
  });
  return NextResponse.json({ task });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });
  const result = await prisma.task.deleteMany({ where: { id, userId: user.id } });
  if (!result.count) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
