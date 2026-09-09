import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const statuses = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

    const title = String(body.title ?? "").trim();
    if (!title || title.length > 200) {
      return NextResponse.json({ error: "A task title between 1 and 200 characters is required." }, { status: 400 });
    }

    const priority = priorities.includes(String(body.priority) as typeof priorities[number])
      ? String(body.priority) as typeof priorities[number]
      : "MEDIUM";
    const dueAt = body.dueAt ? new Date(String(body.dueAt)) : null;
    if (dueAt && Number.isNaN(dueAt.getTime())) {
      return NextResponse.json({ error: "Invalid due date." }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title,
        description: body.description ? String(body.description).slice(0, 2000) : null,
        dueAt,
        priority,
        category: body.category ? String(body.category).slice(0, 100) : null,
        recurring: body.recurring === true || body.recurring === "true",
        recurrence: body.recurrence ? String(body.recurrence).slice(0, 100) : null,
      },
    });

    const acceptsJson = request.headers.get("accept")?.includes("application/json");
    if (acceptsJson || contentType.includes("application/json")) {
      return NextResponse.json({ task }, { status: 201 });
    }
    return NextResponse.redirect(new URL("/tasks", request.url), 303);
  } catch {
    return NextResponse.json({ error: "Unable to create task." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });

  const existing = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  const status = typeof body.status === "string" && statuses.includes(body.status as typeof statuses[number])
    ? body.status as typeof statuses[number]
    : undefined;
  const dueAt = typeof body.dueAt === "string" ? (body.dueAt ? new Date(body.dueAt) : null) : undefined;
  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: "Invalid due date." }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(typeof body.title === "string" ? { title: body.title.trim().slice(0, 200) } : {}),
      ...(typeof body.description === "string" ? { description: body.description.trim().slice(0, 2000) || null } : {}),
      ...(status ? { status, completedAt: status === "COMPLETED" ? new Date() : null } : {}),
      ...(typeof body.priority === "string" && priorities.includes(body.priority as typeof priorities[number]) ? { priority: body.priority as typeof priorities[number] } : {}),
      ...(typeof body.category === "string" ? { category: body.category.trim().slice(0, 100) || null } : {}),
      ...(dueAt !== undefined ? { dueAt } : {}),
    },
  });

  return NextResponse.json({ task });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });

  const result = await prisma.task.deleteMany({ where: { id, userId: user.id } });
  if (!result.count) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
